/**
* @factory
*/
function _WebSocketApi(
    browser_webSocket
    , net_http_webSocketFrame
    , eventEmitter
    , utils_guid
    , reporter
    , info
) {
    /**
    * @alias
    */
    var webSocketFrame = net_http_webSocketFrame
    /**
    * @switch
    */
    , isBroswer = !!browser_webSocket;

    return WebSocketApi;

    /**
    * @worker
    */
    function WebSocketApi(config, socket, isClient) {
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
                , "isClient": {
                    "enumerable": true
                    , "value": isClient
                }
            }
        );

        //add the listeners
        if (!!config.listeners) {
            addListeners(
                config
                , socketApi
            );
        }

        return socketApi;
    }

    /**
    * @function
    */
    function addListeners(config, socketApi) {
        if (!!config.listeners.open) {
            socketApi.on(
                "open"
                , config.listeners.open
            );
        }
        if (!!config.listeners.message) {
            socketApi.on(
                "message"
                , config.listeners.message
                , {
                    "runAsync": true
                }
            );
        }
        if (!!config.listeners.error) {
            socketApi.on(
                "error"
                , config.listeners.error
            );
        }
        if (!!config.listeners.close) {
            socketApi.on(
                "close"
                , config.listeners.close
            );
        }
        if (!!config.listeners.serverError) {
            socketApi.on(
                "serverError"
                , config.listeners.serverError
            );
        }
        if (!!config.listeners.serverClose) {
            socketApi.on(
                "serverClose"
                , config.listeners.serverClose
            );
        }
    }
    /**
    * @function
    */
    function send(config, socket, message, isDirectWrite) {
       try {
           if (isBroswer) {
               socket.send(message);
           }
           else {
               if (isDirectWrite) {
                   socket.write(message);
               }
               else {
                   webSocketFrame.send(
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
}