/**
* @test
*   @title PunyJS.core.proxy._BiDirectionalWatcher: basic test
*/
function biDirectionalWatcherTest1(
    controller
    , mock_callback
) {
    var watcher, target, proxyA, proxyZ, utils_proxy_createWatcher;

    arrange(
        async function arrange() {
            utils_proxy_createWatcher = mock_callback(
                function mockCreateWatcher() {
                    return {
                        "on": function(){}
                        , "emit": function(){}
                    };
                }
            );
            watcher = await controller(
                [
                    ":PunyJS.core.proxy._BiDirectionalWatcher"
                    , [
                        , utils_proxy_createWatcher
                    ]
                ]
            );
            target = {

            };
        }
    );

    act(
        function act() {
            [proxyA, proxyZ] = watcher(
                target
            );
        }
    );

    assert(
        function assert(test) {
            test("The createWnatcher mock should be called twice")
            .value(utils_proxy_createWatcher)
            .hasBeenCalled(2)
            ;

            test("proxyA's emit funtion should equal proxyZ's prototype emit function")
            .value(proxyA, "value")
            .equals(Object.getPrototypeOf(proxyZ).emit)
            ;

            test("proxyZ's emit funtion should equal proxyA's prototype emit function")
            .value(proxyZ, "value")
            .equals(Object.getPrototypeOf(proxyA).emit)
            ;
        }
    );
}