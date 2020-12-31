/**
* @test
*   @title PunyJS.core.net.http._WebSocketFrame:
*/
function webSocketTest1(
    controller
    , mock_callback
) {
    var webSocketFrame, node_buffer, net_http_webSocketHandshake;

    arrange(
        async function arrangeFn() {
            node_buffer = {
                "concat": mock_callback()
                , "from": mock_callback()
                , "alloc": mock_callback()
            };
            net_http_webSocketHandshake = {
                "handle": mock_callback()
            };
            webSocketFrame = controller(
                [
                    ":PunyJS.core.net.http._WebSocketFrame"
                    , [
                        , node_buffer
                        ,
                        , net_http_webSocketHandshake
                    ]
                ]
            );
        }
    );

    act(
        function actFn() {

        }
    );

    assert(
        function assertFn(test) {


        }
    );
}