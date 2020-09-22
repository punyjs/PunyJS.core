/**
* This is a wrapper for the http2 web socket, creating a common interface for both the web and node implementation.
* @factory
*/
function _WebSocket(
    promise
    , browser_webSocket
    , node_tls
    , node_net
    , net_http_url
    , net_http_webSocketFrame
    , net_http_webSocketHandshake
    , net_http_webSocketApi
    , utils_applyIf
    , is_object
    , reporter
    , info
    , defaults
    , constants
    , errors
) {

    /**
    * @alias
    */
    var webSocketFrame = net_http_webSocketFrame
    /**
    * @alias
    */
    , webSocketHandshake = net_http_webSocketHandshake
    /**
    * @alias
    */
    , webSocketApi = net_http_webSocketApi
    /**
    * @alias
    */
    , url = net_http_url
    /**
    * @switch
    */
    , isBroswer = !!browser_webSocket
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
        var configUrl;
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
            if (!!config.url && !config.hostname) {
                configUrl = new url(
                    config.url
                );
                config.hostname = configUrl.hostname;
            }
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
        , socketApi = webSocketApi(
           config
           , socket
           , true
       );
        //add the listeners
        socket.on(
            "open"
            , onOpen.bind(
                null
                , config
                , socketApi
            )
        );
        socket.on(
            "data"
            , webSocketFrame.handle.bind(
                null
                , config
                , socketApi
                , onMessage
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

        //send the handshake
        webSocketHandshake.sendClient(
            config
            , socketApi
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
        , socketApi = webSocketApi(
            config
            , socket
        );
        //setup the listeners
        socket.onopen = function onBrowserOpen(event) {
            socketApi.socketReady = true;
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
        , serverApi = webSocketApi(
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
        var clientSocketApi = webSocketApi(
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
            , function onData(message) {
                onClientFrame(
                    config
                    , clientSocketApi
                    , message
                );
            }
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
    function onClientFrame(config, clientSocketApi, message) {
        try {
            //if the socket is marked ready then this is a handshake request
            if (!clientSocketApi.socketReady) {
                webSocketHandshake.handle(
                    config
                    , clientSocketApi
                    , message
                )
                //then signal open after the handshake is done
                .then(function thenSignalOpen() {
                    return onOpen(
                        config
                        , clientSocketApi
                    );
                })
                .catch(function catchHandshakeError(error) {
                    clientSocketApi.exception = error;
                    reporter.error(
                        error
                    );
                });
            }
            else {
                webSocketFrame.handle(
                    config
                    , clientSocketApi
                    , onMessage
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
    }
    /**
    * Handles a message from the server
    * @function
    */
    function onMessage(config, socketApi, message) {
        if (!socketApi.socketReady) {
            return;
        }
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
    }
}