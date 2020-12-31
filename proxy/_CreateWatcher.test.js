/**
* @test
*   @title PunyJS.core.object._CreateWatcher: basic unit test
*/
function createWatcherTest1(
    controller
) {
    var eventEmitter, createWatcher, events, target, watched, watched;

    arrange(
        async function arrange() {
            eventEmitter = await controller(
                [":PunyJS.core.event._EventEmitter", []]
            );
            target = {
                "property1": "value1"
            }
            , events = eventEmitter()
            ;

            createWatcher = await controller(
                [":PunyJS.core.proxy._CreateWatcher", []]
            );
        }
    );

    act(
        function act() {
            watched = createWatcher(
                target
                , events
            );
            watched.property1 = "update1";
        }
    );

    assert(
        function assert(test) {
            test("watched should be an object with the original properties")
            .value(watched)
            .isOfType("object")
            .hasProperty("property1")
            ;

            test("watched should have the event properties")
            .value(watched)
            .hasProperty("on")
            .hasProperty("off")
            .hasProperty("emit")
            ;
        }
    );
}
/**
* @test
*   @title PunyJS.core.object._CreateWatcher: set trap
*/
function createWatcherTest2(
    controller
    , mock_callback
) {
    var eventEmitter, createWatcher, events, target, watched, watched
    , cb = mock_callback();

    arrange(
        async function arrange() {
            eventEmitter = await controller(
                [":PunyJS.core.event._EventEmitter", []]
            );
            target = {
                "property1": "value1"
                , "sub": {
                    "property2": "value2"
                }
            }
            , events = eventEmitter()
            ;

            createWatcher = await controller(
                [":PunyJS.core.proxy._CreateWatcher", []]
            );
        }
    );

    act(
        function act() {
            watched = createWatcher(
                target
                , events
            );
            watched.on("property1", cb);
            watched.on("sub.property2", cb);
            watched.property1 = "update1";
            watched.sub.property2 = "update2";
        }
    );

    assert(
        function assert(test) {
            test("The callback sould be called twice")
            .value(cb)
            .hasBeenCalled(2)
            ;

            test("The first call to callback should be")
            .value(cb)
            .getCallbackArg(0, 0)
            .stringify()
            .equals('{"action":"set","key":"property1","value":"update1","oldValue":"value1","miss":false}')
            ;

            test("The second call to callback should be")
            .value(cb)
            .getCallbackArg(1, 0)
            .stringify()
            .equals('{"action":"set","key":"sub.property2","value":"update2","oldValue":"value2","miss":false}')
            ;
        }
    );
}
/**
* @test
*   @title PunyJS.core.object._CreateWatcher: get trap, no details
*/
function createWatcherTest3(
    controller
    , mock_callback
) {
    var eventEmitter, createWatcher, events, target, watched, watched
    , cb = mock_callback();

    arrange(
        async function arrange() {
            eventEmitter = await controller(
                [":PunyJS.core.event._EventEmitter", []]
            );
            target = {
                "property1": "value1"
                , "sub": {
                    "property2": "value2"
                }
            }
            , events = eventEmitter()
            ;

            createWatcher = await controller(
                [":PunyJS.core.proxy._CreateWatcher", []]
            );
        }
    );

    act(
        function act() {
            watched = createWatcher(
                target
                , events
                , {
                    "traps": [
                        "get"
                    ]
                    , "includeDetails": []
                }
            );
            //get listeners
            watched.on("get property1", cb);
            watched.on("get sub.property2", cb);
            //set listeners, should not be called
            watched.on("property1", cb);
            watched.on("sub.property2", cb);
            watched.property1;
            watched.sub.property2;
            watched.property1 = "update1";
            watched.sub.property2 = "update2";
        }
    );

    assert(
        function assert(test) {
            test("The callback sould be called twice")
            .value(cb)
            .hasBeenCalled(2)
            ;

            test("The first call to callback should be")
            .value(cb)
            .getCallbackArg(0, 0)
            .stringify()
            .equals('"property1"')
            ;

            test("The second call to callback should be")
            .value(cb)
            .getCallbackArg(1, 0)
            .stringify()
            .equals('"sub.property2"')
            ;
        }
    );
}
/**
* @test
*   @title PunyJS.core.object._CreateWatcher: delete trap, include detail
*/
function createWatcherTest4(
    controller
    , mock_callback
) {
    var eventEmitter, createWatcher, events, target, watched, watched
    , cb = mock_callback();

    arrange(
        async function arrange() {
            eventEmitter = await controller(
                [":PunyJS.core.event._EventEmitter", []]
            );
            target = {
                "property1": "value1"
                , "sub": {
                    "property2": "value2"
                }
            }
            , events = eventEmitter()
            ;

            createWatcher = await controller(
                [":PunyJS.core.proxy._CreateWatcher", []]
            );
        }
    );

    act(
        function act() {
            watched = createWatcher(
                target
                , events
                , {
                    "traps": [
                        "delete"
                    ]
                    , "includeDetails": [
                        "delete"
                    ]
                }
            );
            //get listeners
            watched.on("delete property1", cb);
            watched.on("delete sub.property2", cb);
            delete watched.property1;
            delete watched.sub.property2;
        }
    );

    assert(
        function assert(test) {
            test("The callback sould be called twice")
            .value(cb)
            .hasBeenCalled(2)
            ;

            test("The first call to callback should be")
            .value(cb)
            .getCallbackArg(0, 0)
            .stringify()
            .equals('{"action":"delete","key":"property1","oldValue":"value1","miss":false}')
            ;

            test("The second call to callback should be")
            .value(cb)
            .getCallbackArg(1, 0)
            .stringify()
            .equals('{"action":"delete","key":"sub.property2","oldValue":"value2","miss":false}')
            ;
        }
    );
}
/**
* @test
*   @title PunyJS.core.object._CreateWatcher: apply trap, include detail
*/
function createWatcherTest5(
    controller
    , mock_callback
) {
    var eventEmitter, createWatcher, events, target, watched, watched
    , cb = mock_callback();

    arrange(
        async function arrange() {
            eventEmitter = await controller(
                [":PunyJS.core.event._EventEmitter", []]
            );
            target = {
                "property1": function cb() {}
            }
            , events = eventEmitter()
            ;

            createWatcher = await controller(
                [":PunyJS.core.proxy._CreateWatcher", []]
            );
        }
    );

    act(
        function act() {
            watched = createWatcher(
                target
                , events
                , {
                    "traps": [
                        "apply"
                    ]
                    , "includeDetails": [
                        "apply"
                    ]
                    , "preserveTarget": true
                }
            );
            //get listeners
            watched.on("apply property1", cb);
            watched.property1.apply({"scope":"this"}, ["arg1","arg2"])
        }
    );

    assert(
        function assert(test) {
            test("The callback sould be called once")
            .value(cb)
            .hasBeenCalled(1)
            ;

            test("The first call to callback should be")
            .value(cb)
            .getCallbackArg(0, 0)
            .stringify()
            .equals('{"action":"apply","key":"property1","scope":{"scope":"this"},"args":["arg1","arg2"]}')
            ;
        }
    );
}
/**
* @test
*   @title PunyJS.core.object._CreateWatcher: construct trap, include detail
*/
function createWatcherTest6(
    controller
    , mock_callback
) {
    var eventEmitter, createWatcher, events, target, watched, watched
    , cb = mock_callback();

    arrange(
        async function arrange() {
            eventEmitter = await controller(
                [":PunyJS.core.event._EventEmitter", []]
            );
            target = {
                "property1": function construct() {
                    return this;
                }
            }
            , events = eventEmitter()
            ;

            createWatcher = await controller(
                [":PunyJS.core.proxy._CreateWatcher", []]
            );
        }
    );

    act(
        function act() {
            watched = createWatcher(
                target
                , events
                , {
                    "traps": [
                        "construct"
                    ]
                    , "includeDetails": [
                        "construct"
                    ]
                    , "preserveTarget": true
                }
            );
            //get listeners
            watched.on("construct property1", cb);
            new watched.property1("arg1", "arg2");
        }
    );

    assert(
        function assert(test) {
            test("The callback sould be called once")
            .value(cb)
            .hasBeenCalled(1)
            ;

            test("The first call to callback should be")
            .value(cb)
            .getCallbackArg(0, 0)
            .stringify()
            .equals('{"action":"construct","key":"property1","args":["arg1","arg2"]}')
            ;
        }
    );
}
/**
* @test
*   @title PunyJS.core.object._CreateWatcher: preserveTarget true
*/
function createWatcherTest7(
    controller
    , mock_callback
) {
    var eventEmitter, createWatcher, events, target, watched, watched;

    arrange(
        async function arrange() {
            eventEmitter = await controller(
                [":PunyJS.core.event._EventEmitter", []]
            );
            target = {
                "property1": "value1"
            }
            , events = eventEmitter()
            ;

            createWatcher = await controller(
                [":PunyJS.core.proxy._CreateWatcher", []]
            );
        }
    );

    act(
        function act() {
            watched = createWatcher(
                target
                , events
                , true
            );
            watched.property1 = "update1";
        }
    );

    assert(
        function assert(test) {
            test("The original target should be updated")
            .value(target, "property1")
            .equals("update1")
            ;
        }
    );
}
/**
* @test
*   @title PunyJS.core.object._CreateWatcher: wildcard
*/
function createWatcherTest8(
    controller
    , mock_callback
) {
    var eventEmitter, createWatcher, events, target, watched, watched, cb1, cb2;

    arrange(
        async function arrange() {
            eventEmitter = await controller(
                [":PunyJS.core.event._EventEmitter", []]
            );
            target = {
                "prop1": "value1"
                , "sub1": {
                    "sub2": {
                        "prop2": "value2"
                        , "prop3": "value3"
                    }
                }
            }
            , events = eventEmitter()
            ;
            createWatcher = await controller(
                [":PunyJS.core.proxy._CreateWatcher", []]
            );
            cb1 = mock_callback();
            cb2 = mock_callback();
        }
    );

    act(
        function act() {
            watched = createWatcher(
                target
                , events
            );
            watched.on("sub1.sub2.*", cb1);
            watched.on("*", cb2);
            watched.prop1 = "updated1";
            watched.sub1.sub2.prop3 = "update3";
            watched.sub1.prop4 = "update4";
        }
    );

    assert(
        function assert(test) {
            test("callback 1 should be called with")
            .value(cb1)
            .hasBeenCalled(1)
            .getCallbackArg(0, 0)
            .stringify()
            .equals('{"action":"set","key":"sub1.sub2.prop3","value":"update3","oldValue":"value3","miss":false}')
            ;

            test("callback 2 should be first called with")
            .value(cb2)
            .hasBeenCalled(3)
            .getCallbackArg(0, 0)
            .stringify()
            .equals('{"action":"set","key":"prop1","value":"updated1","oldValue":"value1","miss":false}');

            test("callback 2 should be second called with")
            .value(cb2)
            .getCallbackArg(1, 0)
            .stringify()
            .equals('{"action":"set","key":"sub1.sub2.prop3","value":"update3","oldValue":"value3","miss":false}');

            test("callback 2 should be third called with")
            .value(cb2)
            .getCallbackArg(2, 0)
            .stringify()
            .equals('{"action":"set","key":"sub1.prop4","value":"update4","miss":true}');
        }
    );
}
/**
* @test
*   @title PunyJS.core.object._CreateWatcher: listeners added to child
*/
function createWatcherTest9(
    controller
    , mock_callback
) {
    var eventEmitter, createWatcher, events, target, watched, watched, cb1;

    arrange(
        async function arrange() {
            eventEmitter = await controller(
                [":PunyJS.core.event._EventEmitter", []]
            );
            target = {
                "prop1": "value1"
                , "sub1": {
                    "sub2": {
                        "prop2": "value2"
                        , "prop3": "value3"
                    }
                }
            }
            , events = eventEmitter()
            ;
            createWatcher = await controller(
                [":PunyJS.core.proxy._CreateWatcher", []]
            );
            cb1 = mock_callback();
        }
    );

    act(
        function act() {
            watched = createWatcher(
                target
                , events
            );
            watched.sub1.on("sub2.*", cb1);
            watched.prop1 = "updated1";
            watched.sub1.sub2.prop3 = "update3";
            watched.sub1.prop4 = "update4";
        }
    );

    assert(
        function assert(test) {
            test("The callback should be called once")
            .value(cb1)
            .hasBeenCalled(1)
            .getCallbackArg(0, 0)
            .stringify()
            .equals('{"action":"set","key":"sub1.sub2.prop3","value":"update3","oldValue":"value3","miss":false}')
            ;
        }
    );
}
/**
* @test
*   @title PunyJS.core.object._CreateWatcher: using arrays
*/
function createWatcherTest10(
    controller
    , mock_callback
) {
    var eventEmitter, createWatcher, events, target, watched, watched, cb1;

    arrange(
        async function arrange() {
            eventEmitter = await controller(
                [":PunyJS.core.event._EventEmitter", []]
            );
            target = {
                "prop1": "value1"
                , "sub1": [
                    {
                        "member1": "value1"
                    }
                    , "member2"
                    , [
                        "member3"
                        , {
                            "prop3": "value3"
                        }
                    ]
                ]
            }
            , events = eventEmitter()
            ;
            createWatcher = await controller(
                [":PunyJS.core.proxy._CreateWatcher", []]
            );
            cb1 = mock_callback();
        }
    );

    act(
        function act() {
            watched = createWatcher(
                target
                , events
                , {
                    "traps": ["set", "get", "delete"]
                    , "includeDetails": ["set", "get", "delete"]
                }
            );
            watched.sub1.on(["*","delete *"], cb1);
            //append
            watched.sub1.push("new member");
            //remove the first member
            watched.sub1.splice(0, 1);
            //insert
            watched.sub1.splice(1, 0, "inserted member");
            //remove one member using the length
            watched.sub1.length = 3;
            //delete a member, but no removal
            delete watched.sub1[0];
        }
    );

    assert(
        function assert(test) {
            test("The callback should be called 12 times")
            .value(cb1)
            .hasBeenCalled(5)
            ;

            test("The 1st callback should be called with")
            .value(cb1)
            .getCallbackArg(0, 0)
            .stringify()
            .equals('{"action":"set","key":"sub1.3","value":"new member","arrayAction":"append","miss":true}')
            ;

            test("The 2nd callback should be called with")
            .value(cb1)
            .getCallbackArg(1, 0)
            .stringify()
            .equals('{"action":"delete","key":"sub1.0","oldValue":{"member1":"value1"},"arrayAction":"delete","miss":false}')
            ;

            test("The 3rd callback should be called with")
            .value(cb1)
            .getCallbackArg(2, 0)
            .stringify()
            .equals('{"action":"set","key":"sub1.1","value":"inserted member","oldValue":["member3",{"prop3":"value3"}],"arrayAction":"insert","miss":false}')
            ;

            test("The 4th callback should be called with")
            .value(cb1)
            .getCallbackArg(3, 0)
            .stringify()
            .equals('{"action":"delete","key":"sub1.3","oldValue":"new member","miss":false}')
            ;

            test("The 5th callback should be called with")
            .value(cb1)
            .getCallbackArg(4, 0)
            .stringify()
            .equals('{"action":"delete","key":"sub1.0","oldValue":"member2","miss":false}')
            ;

            test("The target should be")
            .value(target)
            .stringify()
            .equals('{"prop1":"value1","sub1":[null,"inserted member",["member3",{"prop3":"value3"}]]}')
            ;
        }
    );
}