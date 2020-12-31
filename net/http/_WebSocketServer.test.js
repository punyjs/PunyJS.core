/**
* @test
*   @title PunyJS.core.net.http._WebSocketServer: defaults
*/
function webSocketServerTest1(
    controller
    , mock_callback
) {
    var webSocket, server, node_tls, node_net, net_http_webSocketFrame, net_http_webSocketHandshake, net_http_webSocketApi, config, socketApi;

    arrange(
        async function arrangeFn() {
            server = {
                "on": mock_callback()
                , "listen": mock_callback()
            };
            node_tls = {
                "createServer": mock_callback(
                    server
                )
            };
            node_net = {
                "createServer": mock_callback(
                    server
                )
            };
            net_http_webSocketFrame = {
                "handle": mock_callback()
            };
            net_http_webSocketHandshake = {
                "sendClient": mock_callback()
                , "handle": mock_callback()
            };
            net_http_webSocketApi = mock_callback();
            webSocket = await controller(
                [
                    ":PunyJS.core.net.http._WebSocketServer"
                    , [
                        node_net
                        , node_tls
                        , net_http_webSocketFrame
                        , net_http_webSocketHandshake
                        , net_http_webSocketApi
                    ]
                ]
            );
            config = {
                "port": 8443
                , "autoListen": true
            };
        }
    );

    act(
        function actFn() {
            socketApi = webSocket(
                config
            );
        }
    );

    assert(
        function assertFn(test) {
            test("The node_tls createServer should be called once with")
            .value(node_tls, "createServer")
            .hasBeenCalled(1)
            .hasBeenCalledWithArg(0, 0, config)
            .getCallbackArg(0, 1)
            .isOfType("function")
            ;

            test("The websocket api should be called once with")
            .value(net_http_webSocketApi)
            .hasBeenCalled(1)
            .hasBeenCalledWithArg(0, 0, config)
            .hasBeenCalledWithArg(0, 1, server)
            .getCallbackArg(0, 1)
            .stringify()
            .equals('{}')
            ;

            test("There should be an error and close listener")
            .value(server, "on")
            .hasBeenCalled(2)
            .hasBeenCalledWithArg(0, 0, "error")
            .hasBeenCalledWithArg(1, 0, "close")
            ;

            test("The listen method should be called once")
            .value(server, "listen")
            .hasBeenCalled(1)
            .hasBeenCalledWithArg(0, 0, config.port)
            ;


        }
    );
}