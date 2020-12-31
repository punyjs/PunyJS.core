/**
* @factory
*/
function _WebSocketClient(
    browser_webSocket
    , node_tls
    , node_net
    , net_http_webSocketFrame
    , net_http_webSocketHandshake
    , net_http_webSocketApi
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
    ;

    return WebSocketClient;

    /**
    * @worker
    */
    function WebSocketClient(config) {
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
    * Handles the closing of the client socket
    * @function
    */
    function onClose(config, socketApi) {
        /// LOGGING
        reporter.tcp(
            info.core.net.http.socket_client_closing
        );
        /// END LOGGING
        socketApi.emit(
            "close"
            , socketApi
        );
    }
}