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
                        utils_proxy_createWatcher
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
            test("The createWatcher mock should be called twice")
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
/**
* @test
*   @title PunyJS.core.proxy._BiDirectionalWatcher: functional test
*/
function biDirectionalWatcherTest2(
    controller
    , mock_callback
) {
    var watcher, target, proxyA, proxyZ, callbackA, callbackZ;

    arrange(
        async function arrange() {
            watcher = await controller(
                [
                    ":PunyJS.core.proxy._BiDirectionalWatcher"
                    , [

                    ]
                ]
            );
            target = {

            };
            callbackA = mock_callback();
            callbackZ = mock_callback();
        }
    );

    act(
        function act() {
            [proxyA, proxyZ] = watcher(
                target
            );
            proxyA.on(
                "*"
                , callbackA
            );
            proxyZ.on(
                "*"
                , callbackZ
            );
            proxyA.newprop = "new value 1";
            proxyZ.newprop = "new value 2";
        }
    );

    assert(
        function assert(test) {
            test("callbackA should be called")
            .value(callbackA)
            .hasBeenCalled(1)
            .getCallbackArg(0, 0)
            .stringify()
            .equals('{"action":"set","name":"newprop","key":"newprop","value":"new value 2","oldValue":"new value 1","miss":false}')
            ;

            test("callbackZ should be called")
            .value(callbackZ)
            .hasBeenCalled(1)
            .getCallbackArg(0, 0)
            .stringify()
            .equals('{"action":"set","name":"newprop","key":"newprop","value":"new value 1","miss":true}')
            ;
        }
    );
}