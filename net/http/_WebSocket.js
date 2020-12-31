/**
* This is a wrapper for the http web socket, creating a common interface for both the web and node implementation.
* @factory
*/
function _WebSocket(
    promise
    , browser_webSocket
    , node_tls
    , node_net
    , net_http_url
    , net_http_webSocketServer
    , net_http_webSocketClient
    , utils_applyIf
    , is_object
    , defaults
    , errors
) {

    /**
    * @alias
    */
    var webSocketServer = net_http_webSocketServer
    /**
    * @alias
    */
    , webSocketClient = net_http_webSocketClient
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
            return webSocketServer(
                config
            );
        }
        else {
            return webSocketClient(
                config
            );
        }
    }
}