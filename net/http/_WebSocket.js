/**
* This is a wrapper for the http2 web socket, creating a common interface for both the web and node implementation.
* @factory
*/
function _WebSocket(
    browser_webSocket
    , node_tls
    , node_net
    , node_buffer
    , url
    , net_http_httpMessage
    , net_http_frameOpcodes
    , eventEmitter
    , security_crypto
    , utils_guid
    , utils_applyIf
    , is_object
    , is_string
    , is_nill
    , encode
    , decode
    , reporter
    , info
    , defaults
    , constants
    , errors
) {

    /**
    * @alias
    */
    var httpMessage = net_http_httpMessage
    /**
    * @alias
    */
    , frameOpcodes = net_http_frameOpcodes
    /**
    * @switch
    */
    , isBroswer = !!browser_webSocket

    , MAX_SIZE_64 = BigInt(18446744073709551614)
    ;

    return WebSocket;

    /**
    * @worker
    *   @param {object} config The configuration object
    *       @param {string} [url] Client side, url of the server
    *       @param {string} [ca] Client side, the public cert (for node only)
    *       @param {number} [port] Server side, the port number to listen to
    *       @param {string} [key] Server side, the private key
    *       @param {string} [cert] Server side, the public cert
    *       @param {string} [encoding]
    *       @param {number} [timeout] The number of milliseconds to wait ...
    *       @param {object} listeners A collection of listener functions, the key being the event to listen for, i.e. `close` listens for `onclose`, and the value is the function that will handle the event
    */
    function WebSocket(config) {
        //validate and initialize the configuration
        initializeConfig(
            config
        );
        //create the websocket
        var socketApi = createWebSocket(
            config
        );
        //return the api
        return socketApi;
    };

    /**
    * @function
    */
    function initializeConfig(config) {
        ///INPUT VALIDATION
        validateConfig(
            config
        );
        ///END INPUT VALIDATION
        //determine the socket type
        setSocketType(
            config
        );
        //add the common config
        utils_applyIf(
            defaults.core.net.http.webSocket.common
            , config
        );
        //if a server, add the clients collection
        if (config.type === "server") {
            config.clients = Object.create(null);
            //add any default server configurations
            utils_applyIf(
                defaults.core.net.http.webSocket.server
                , config
            );
        }
        else {
            //add any default client configurations
            utils_applyIf(
                defaults.core.net.http.webSocket.client
                , config
            );
        }
    }
    /**
    * @function
    */
    function validateConfig(config) {
        ///TODO: add validation rules and throw errors
    }
    /**
    * @function
    */
    function setSocketType(config) {
        //node
        if (!!node_tls) {
            //client side
            if (!!config.url) {
                config.type = "client";
                config.engine = "node";
            }
            else {
                config.type = "server";
                config.engine = "node";
            }
        }
        //browser
        else if (isBroswer) {
            //browser is currently only cient side
            config.type = "client";
            config.engine = "browser";
        }
        //unknown socket type
        else {
            throw new Error(
                errors.core.net.http.invalid_socket_type
            );
        }
    }

    /**
    * Creates either a client or a serve rweb socket based on the socket type
    * @function
    */
    function createWebSocket(config) {
        //TODO: switch to using a socket st ate object
        if (config.type === "server") {
            return createServer(
                config
            );
        }
        else {
            return createClient(
                config
            );
        }
    }

    /**
    * Creates either a node or browser client
    * @function
    */
    function createClient(config) {
        if (config.engine === "browser") {
            return createBrowserClient(
                config
            );
        }
        else if (config.engine === "node") {
            return createNodeClient(
                config
            );
        }
        ///TODO: throw error
    }
    /**
    * @function
    */
    function createNodeClient(config) {
        //connect to the server
        var socket = config.secure
            ? node_tls.connect(
                config
            )
            : node_net.connect(
                config
            )
        //create the socket api
        , socketApi = createSocketApi(
            config
            , socket
        )
        ;
        //set the encoding
        socket.setEncoding(config.encoding);
        //add the listeners
        stream.on(
            "open"
            , onOpen.bind(
                null
                , config
                , socketApi
            )
        );
        stream.on(
            "data"
            , onMessage.bind(
                null
                , config
                , socketApi
            )
        );
        socket.on(
            "error"
            , onError.bind(
                null
                , config
                , socketApi
            )
        );
        socket.on(
            "close"
            , onClose.bind(
                null
                , config
                , socketApi
            )
        );

        return socketApi;
    }
    /**
    * @function
    */
    function createBrowserClient(config, meta) {
        var socket = new browser_webSocket(
            config.url
        )
        //create the socket api
        , socketApi = createSocketApi(
            config
            , socket
        );
        //setup the listeners
        socket.onopen = function onBrowserOpen(event) {
            onOpen(
                config
                , socketApi
            );
        };
        socket.onmessage = function onBrowserMessage(event) {
            onMessage(
                config
                , socketApi
                , event.data
            );
        };
        socket.onerror = function onBrowserError(event) {
            onError(
                config
                , socketApi
                , errors.core.net.http.generic_socket_error
            );
        };
        socket.onclose = function onBrowserClose(event) {
            onClose(
                config
                , socketApi
            );
        };

        return socketApi;
    }

    /**
    * Creates a node web socket server
    * @function
    */
    function createServer(config) {
        var clients = {}
        , newServer = config.insecure
            ? node_net.createServer
            : node_tls.createServer
        , server = newServer(
            config
            , onClientConnect.bind(
                null
                , config
                , serverApi
                , clients
            )
        )
        , serverApi = createSocketApi(
            config
            , server
            , clients
        );
        //setup the server listeners
        server.on(
            "error"
            , onServerError.bind(
                null
                , config
                , serverApi
            )
        );
        server.on(
            "close"
            , onServerClose.bind(
                null
                , config
                , serverApi
                , clients
            )
        );

        if (config.autoListen === true) {
            server.listen(
                config.port
            );
        }

        return server;
    }
    /**
    * @function
    */
    function onClientConnect(config, serverApi, clients, clientSocket) {
        //create the client socket api
        var clientSocketApi = createSocketApi(
            config
            , clientSocket
        );
        //add the client to the clients collection
        clients[clientSocketApi.id] = clientSocketApi;
        //add the client listeners
        clientSocket.on(
            "error"
            , onError.bind(
                null
                , config
                , clientSocketApi
            )
        );
        //add a data handler for the handlshake
        clientSocket.on(
            "data"
            , onClientMessage.bind(
                null
                , config
                , clientSocketApi
            )
        );
        //
        clientSocket.on(
            "close"
            , onClose.bind(
                null
                , config
                , clientSocketApi
            )
        );
    }
    /**
    * @function
    */
    function onClientMessage(config, clientSocketApi, message) {
        try {
            if (!clientSocketApi.socketReady) {
                answerClientHandshake(
                    config
                    , clientSocketApi
                    , message
                );
                onOpen(
                    config
                    , clientSocketApi
                );
            }
            else {
                onFrame(
                    config
                    , clientSocketApi
                    , message
                );
            }
        }
        catch(ex) {
            reporter.error(ex);
        }
    }
    /**
    * @function
    */
    function answerClientHandshake(config, socketApi, message) {
        //process the text message
        var request = httpMessage.decodeHttpRequest(
            message
        )
        , wsOptions = getWsOptions(
            request
        )
        //verify the headers and url/origin
        , verified = verifyClientRequest(
            config
            , socketApi
            , request
            , wsOptions
        );
        //if this didn't pass the client verification it might be a http request
        if (!passed) {
            //run the web handler if there is one
            if (is_func(config.webHandler)) {
                config.webHandler(
                    request
                    , socketApi
                );
                return;
            }
            throw new Error(
                `${errors.core.net.http.invalid_websocket_request}`
            );
        }

        //add the headers and
        Object.defineProperties(
            socketApi
            , {
                "headers": {
                    "enumerable": true
                    , "value": request.headers
                }
                , "socketReady": {
                    "enumerable": true
                    , "value": true
                }
            }
        );
        //send the response
        respondClientHandshake(
            socketApi
            , wsOptions
        );
    }
    /**
    * @function
    */
    function getWsOptions(request) {
        var wsOptions = {};

        Object.keys(constants.core.net.http.webSocket.headerMap)
        .forEach(function forEachOption(option) {
            var header = request.headers[
                constants.core.net.http.webSocket.headerMap[option]
            ];
            wsOptions[option] = header;
        });

        return wsOptions;
    }
    /**
    * @function
    */
    function verifyClientRequest(config, socketApi, request, wsOptions) {
        var headers = request.headers
        , headerKeys = Object.keys(headers)
        , requiredKeys =
            constants.core.net.http.webSocket.handshake.client.requiredHeaders
        , passed = requiredKeys.every(function forEachReqKey(key) {
            return headerKeys.indexOf(key) !== -1;
        });
        ///TODO: verify the Origin
        ///TODO: implement the rest of rfc6455

        return passed;
    }
    /**
    * @function
    */
    function respondClientHandshake(socketApi, wsOptions) {
        //create the response key
        var keyCode = `${wsOptions.key}${constants.core.net.http.webSocket.guid}`
        , keySha1 = security_crypto.sha1(
            keyCode
        )
        , key64 = encode.toBase64(
            keySha1
        )
        //create the http response
        , response = httpMessage.encodeHttpResponse(
            {
                "statusCode": "101"
                , "headers": {
                    "upgrade": "websocket"
                    , "connection": "upgrade"
                    , "sec-websocket-accept": key64
                }
            }
        )
        ;
        //send the response
        socketApi.send(
            response
            , true
        );
    }
    /**
    * @function
    */
    function closeClientSockets(clients) {
        /// LOGGING
        reporter.tcp(
            info.core.net.http.socket_server_closing_clients
        );
        /// END LOGGING
        for(key in clients) {
            try {
                let client = clients[key];
                if (!!client && !client.destroyed) {
                    client.destroy();
                }
            }
            catch(ex) {
                reporter.error(ex);
            }
        }
    }

    /**
    * Handles the opening of a client websocket
    * @function
    */
    function onOpen(config, socketApi) {
        /// LOGGING
        reporter.tcp(
            `${info.core.net.http.socket_client_opening}`
        );
        /// END LOGGING
        ///EVENT open
        socketApi.emit(
            "open"
            , socketApi
        );
        ///END EVENT
        if (config.listeners.open) {
            config.listeners.open(
                socketApi
            );
        }
    }
    /**
    * @function
    */
    function onFrame(config, socketApi, frame) {
        //process the frame
        var fragment = processFrame(
            config
            , socketApi
            , frame
        )
        , message
        ;
        //if there is more, then store the fragment
        if (fragment.hasMore) {
            return;
        }
        //see if this is a control code, if so handle it and return
        if (fragment.opcode > 2) {
            handleControlCode(
                config
                , socketApi
                , fragment
            );
            return;
        }

        //update the buffer
        if (!!socketApi.buffer) {
            socketApi.buffer =
                node_buffer.concat(
                    [
                        socketApi.buffer
                        , fragment.payload
                    ]
                );
        }
        else {
            socketApi.buffer = fragment.payload;
        }

        //if this isn't the final frame then stop here
        if (!fragment.fin) {
            /// LOGGING
            reporter.tcp(
                `${info.core.net.http.socket_frame_received} (length ${fragment.payload.length})`
            );
            /// END LOGGING
            return;
        }

        //get the message from the buffer
        message = socketApi.buffer;
        //cleanup
        delete socketApi.buffer;

        onMessage(
            config
            , socketApi
            , message
        );
    }
    /**
    * Handles a message from the server
    * @function
    */
    function onMessage(config, socketApi, message) {
        /// LOGGING
        reporter.tcp(
            `${info.core.net.http.socket_message_received} (length ${message.length})`
        );
        /// END LOGGING
        ///EVENT message
        socketApi.emit(
            "message"
            , message
            , socketApi
        );
        ///END EVENT
        if (config.listeners.message) {
            config.listeners.message(
                message
                , socketApi
            );
        }
    }
    /**
    * Handles errors on the client socket
    * @function
    */
    function onError(config, socketApi, error) {
        /// LOGGING
        reporter.error(
            error
        );
        /// END LOGGING
        ///EVENT error
        socketApi.emit(
            "error"
            , socketApi
            , error
        );
        ///END EVENT
        if (config.listeners.error) {
            config.listeners.error(
                error
                , socketApi
            );
        }
    }
    /**
    * @function
    */
    function onServerError(config, serverApi, error) {
        /// LOGGING
        reporter.error(
            error
        );
        /// END LOGGING
        ///EVENT servererror
        serverApi.emit(
            "servererror"
            , error
            , serverApi
        );
        ///END EVENT
        if (config.listeners.serverError) {
            config.listeners.serverError(
                error
                , serverApi
            );
        }
    }
    /**
    * @function
    */
    function onServerClose(config, serverApi, clients) {
        /// LOGGING
        reporter.tcp(
            info.core.net.http.server_closing
        );
        /// END LOGGING
        //close all client sockets
        closeClientSockets(
            clients
        );
        ///EVENT serverclose
        serverApi.emit(
            "serverclose"
            , serverApi
        );
        ///END EVENT
        if (config.listeners.serverClose) {
            config.listeners.serverClose(
                serverApi
            );
        }
    }
    /**
    * Handles the closing of the client socket
    * @function
    */
    function onClose(config, socketApi, serverClients) {
        /// LOGGING
        reporter.tcp(
            info.core.net.http.socket_client_closing
        );
        /// END LOGGING
        //if we have a server clients collection, try removing the socket
        if (is_object(serverClients)) {
            delete serverClients[socketApi.id];
        }
        socketApi.emit(
            "close"
            , socketApi
        );
        if (config.listeners.close) {
            config.listeners.close(
                socketApi
            );
        }
    }

    /**
    * Creates the socket api object with the standard properties
    * @function
    */
    function createSocketApi(config, socket) {
        var socketApi = Object.create(
            eventEmitter()
            , {
                //Create a uuid for the client
                "id": {
                    "enumerable": true
                    , "value": utils_guid({ "version": 4 })
                }
                , "status": {
                    "enumerable": true
                    , "get": getSocketStatus.bind(null, socket)
                }
                , "send": {
                    "enumerable": true
                    , "value": send.bind(null, config, socket)
                }
                , "close": {
                    "enumerable": true
                    , "value": closeSocket.bind(null, config, socket)
                }
            }
        );

        return socketApi;
    }
    /**
    * @function
    */
    function send(config, socket, message, isResponse) {
       try {
           if (isBroswer) {
               socket.send(message);
           }
           else {
               if (isResponse) {
                   socket.write(message);
               }
               else {
                   sendFrame(
                       config
                       , socket
                       , message
                   );
               }
           }
           /// LOGGING
           reporter.tcp(
               `${info.core.net.http.socket_message_sent} (length ${message.length})`
           );
           /// END LOGGING
       }
       catch (ex) {
           reporter.error(ex);
       }
   }
    /**
    * @function
    */
    function processFrame(config, socketApi, frame) {
        var fragment;
        //process the additional data from the fragment
        if (!!socketApi.fragment) {
            fragment = socketApi.fragment;
            //combine the payload and the frame
            fragment.payload =
                node_buffer.concat(
                    [
                        fragment.payload
                        , frame
                    ]
                );
            //see if there is more
            if (fragment.payloadLength == fragment.payload.length) {
                fragment.hasMore = false;
                delete socketApi.fragment;
                //unmask the payload
                maskPayload(
                    fragment.payload
                    , fragment.maskingKey
                );
            }

            return fragment;
        }
        //decypher the frame headers
        var hasMaskByte = frame.length > 1
        , mask = !!hasMaskByte
            && frame[1].toString(2)[0] === "1"
        , lenCode = !!hasMaskByte
            && frame[1] & 0x7f
        , frstByte = frame[0].toString(2)
        , opCode = frame[0].toString(16)[1]
        , payloadLength
        , maskingKeyOffset
        , payloadOffset
        ;

        //if the length code is 127 we are using 8 bytes
        if (lenCode === 127) {
            payloadLength = frame.slice(2, 10)
                .readBigInt64BE();
            maskingKeyOffset = 10;
        }
        //if the length code is 126 we are using 2 bytes
        else if (lenCode === 126) {
            payloadLength = frame.slice(2, 4)
                .readInt16BE();
            maskingKeyOffset = 4;
        }
        //else we are using the length code fof the length
        else {
            payloadLength = lenCode;
            maskingKeyOffset = 2;
        }

        payloadOffset = maskingKeyOffset;

        if (mask) {
            payloadOffset+= 4;
        }

        //create the fragment
        fragment = {
            "fin": frstByte[0] === "1"
            , "rsv1": frstByte[1] === "1"
            , "rsv2": frstByte[2] === "1"
            , "rsv3": frstByte[3] === "1"
            , "opcode": opCode
            , "opName": frameOpcodes[opCode]
            , "mask": mask
            , "maskingKey": mask
                ? frame.slice(
                    maskingKeyOffset
                    , payloadOffset
                )
                : null
            , "payloadLength": payloadLength
            , "payload": frame.slice(
                payloadOffset
            )
        };

        fragment.hasMore = payloadLength > fragment.payload.length;

        if (fragment.hasMore) {
            if (!socketApi.fragment) {
                socketApi.fragment = fragment;
            }
        }
        else {
            //unmask the payload
            maskPayload(
                fragment.payload
                , fragment.maskingKey
            );
        }

        //validate the fragment
        ///TODO: validate the frogment as per rfc6455

        return fragment;
    }
    /**
    * Sends a web socket frame. Fragments the payload if needed, based on fragment size in the config. If a client socket, creates a masking key and masks the payload. Adds the web socket headers and sends the fragment on the wire.
    * @function
    */
    function sendFrame(config, socket, payload) {
        var isTextPayload = !!is_string(payload)
        , frameList = new Array(5)
        , payloadBuffer = isTextPayload
            ? node_buffer.from(
                payload
            )
            : payload
        , payloadLen
        , finOpBuffer = node_buffer.from(
            isTextPayload
                ? [0x81]
                : [0x82]
            )
        , maskingKeyBuffer = !!socket.isClient
            ? node_buffer.alloc(4)
            : null
        , payloadLenBuffer = node_buffer.alloc(1)
        , extPayloadLenBuffer
        , frameIndex = 2
        , frameBuffer
        , payloadLen = payloadBuffer.length
        ;
        //add the length
        if (payloadLen < 127) {
            payloadLenBuffer[0] = payloadLen;
        }
        else if (payloadLen < 65536) {
            payloadLenBuffer[0] = 126;
            extPayloadLenBuffer = node_buffer.alloc(2);
            extPayloadLenBuffer.writeUInt16BE(payloadLen);
        }
        else if (payloadLen < MAX_SIZE_64) {
            payloadLenBuffer[0] = 127;
            extPayloadLenBuffer = node_buffer.alloc(8);
            extPayloadLenBuffer.writeBigInt64BE(
                BigInt(payloadLen)
            );
        }
        else {
            //too large
            throw new Error(
                `${errors.core.net.http.payload_exceeds_max_size}`
            );
        }
        //create a masking key, mask the payload, if this is a client
        if (!!maskingKeyBuffer) {
            //create the masking key by filling random bytes
            security_crypto.fillRandomBytes(maskingKeyBuffer);
            //mask the payload
            maskPayload(
                payloadBuffer
                , maskingKeyBuffer
            );
            //set the mask bit
            payloadLenBuffer[0] = payloadLenBuffer[0] | 0x08;
        }
        //create the list of buffers to concatinate into a single frame buffer
        frameList[0] = finOpBuffer;
        frameList[1] = payloadLenBuffer;
        if (!!extPayloadLenBuffer) {
            frameList[frameIndex++] = extPayloadLenBuffer;
        }
        if (!!maskingKeyBuffer) {
            frameList[frameIndex++] = maskingKeyBuffer;
        }
        frameList[frameIndex] = payloadBuffer;
        while(frameList[frameList.length - 1] === undefined) {
            frameList.pop();
        }
        frameBuffer = node_buffer.concat(
            frameList
        );

        socket.write(frameBuffer);
    }
    /**
    * @function
    */
    function handleControlCode(config, socketApi, fragment) {
        ///TODO: implement logic for other control codes
        if (fragment.opcode === "8") {
            socketApi.close();
        }
    }
    /**
    * @function
    */
    function getSocketStatus(socket) {
        if (isBroswer) {
            return socket.readyState;
        }
        else {
            if (socket.pending || socket.connecting) {
                return "CONNECTING";
            }
            else if (socket.destroyed) {
                return "CLOSED";
            }
            else {
                return "OPEN"
            }
        }
    }

    /**
    * @function
    */
    function closeSocket(config, socket) {
        if (isBroswer) {
            socket.close();
        }
        else {
            socket.destroy();
        }
    }
    /**
    * @function
    */
    function maskPayload(payload, maskingKey) {
        //mask/unmask the payload
        for(let i = 0, l = payload.length, j; i < l; i++) {
            j = i % 4;
            payload[i] = payload[i] ^ maskingKey[j];
        }
    }
}