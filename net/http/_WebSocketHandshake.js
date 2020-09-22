/**
* @factory
*/
function _WebSocketHandshake(
    promise
    , net_http_httpMessage
    , net_http_userAgent
    , security_crypto
    , is_func
    , encode
    , decode
    , reporter
    , constants
    , info
    , errors
) {

    /**
    * @alias
    */
    var httpMessage = net_http_httpMessage
    /**
    * @alias
    */
    , userAgent = net_http_userAgent
    ;

    return Object.create(
        null
        , {
            "sendClient": {
                "enumerable": true
                , "value": sendHandshake
            }
            , "handle": {
                "enumerable": true
                , "value": handle
            }
        }
    );

    /**
    * @function
    */
    function sendHandshake(config, socketApi) {
        ///LOGGING
        reporter.tcp(
            `${info.core.net.http.send_handshake_request}`
        );
        ///END LOGGING
        //create the http request
        var clientKey = generateClientKey()
        , requestText = httpMessage.encodeHttpRequest(
            {
                "headers": {
                    "Connection": "Upgrade"
                    , "origin": config.hostname
                    , "Host": config.hostname
                    , "Sec-WebSocket-Key": clientKey
                    , "Sec-WebSocket-Version": "13"
                    , "Upgrade": "websocket"
                    , "User-Agent": userAgent.raw
                }
            }
        );

        //add the client key
        Object.defineProperties(
            socketApi
            , {
                "clientKey": {
                    "enumerable": false
                    , "value": clientKey
                }
            }
        );

        socketApi.send(
            requestText
            , true
        );
    }
    /**
    * @function
    */
    function handle(config, socketApi, message) {
        if (socketApi.isClient) {
            return handleServerResponse(
                config
                , socketApi
                , message
            );
        }
        else {
            return handleClientRequest(
                config
                , socketApi
                , message
            );
        }
    }
    /**
    * @function
    */
    function handleClientRequest(config, socketApi, message) {
        try {
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
            if (!verified) {
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
            return respondClientHandshake(
                socketApi
                , wsOptions
            );
        }
        catch (ex) {
            return promise.reject(ex);
        }
    }
    /**
    * @function
    */
    function handleServerResponse(config, socketApi, message) {
        try {
            ///LOGGING
            reporter.tcp(
                `${info.core.net.http.process_handshake_response} (length ${message.length})`
            );
            ///END LOGGING
            var response = httpMessage.decodeHttpResponse(
                message
            );
            //add the headers and
            Object.defineProperties(
                socketApi
                , {
                    "headers": {
                        "enumerable": true
                        , "value": response.headers
                    }
                    , "socketReady": {
                        "enumerable": true
                        , "value": true
                    }
                }
            );

            return promise.resolve();
        }
        catch(ex) {
            socketApi.close();
            return promise.resolve(ex);
        }
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
            var passed = headerKeys.indexOf(key) !== -1;
            return passed;
        });
        ///TODO: verify the Origin
        ///TODO: implement the rest of rfc6455

        return passed;
    }
    /**
    * @function
    */
    function respondClientHandshake(socketApi, wsOptions) {
        try {
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

            return promise.resolve();
        }
        catch(ex) {
            return promise.reject(ex);
        }
    }
    /**
    * @function
    */
    function generateClientKey() {
        return "1fKrrXaYqmVejHBFy767GA==";
    }
}