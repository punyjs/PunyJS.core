/**
* @factory
*/
function _WebSocketServer(
    node_net
    , node_tls
    , net_http_webSocketFrame
    , net_http_webSocketHandshake
    , net_http_webSocketApi
    , reporter
    , info
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
    ;

    return WebSocketServer;

    /**
    * @worker
    */
    function WebSocketServer(config) {
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
    * Handles the closing of the client socket
    * @function
    */
    function onClose(config, socketApi, serverClients) {
        /// LOGGING
        reporter.tcp(
            info.core.net.http.socket_client_closing
        );
        /// END LOGGING
        delete serverClients[socketApi.id];
        socketApi.emit(
            "close"
            , socketApi
        );
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
}