/**
* The bi-directional watcher produces two proxies, proxyA and proxyZ. When a change is made to proxyA, listeners added to proxyZ will be fired, and vice versa.
* @factory
*/
function _BiDirectionalWatcher(
    utils_proxy_createWatcher
    , is_object
    , utils_copy
    , utils_apply
    , utils_deep
    , eventEmitter
    , errors
    , defaults
) {

    return BiDirectionalWatcher;

    /**
    * @worker
    */
    function BiDirectionalWatcher(target, options) {
        ///INPUT VALIDATION
        if (!is_object(options)) {
            options = {
                "preserveTarget": !!options
            };
        }
        ///END INPUT VALIDATION
        //copy the target so no un-monitored changes can be made
        var internalTarget = !options.preserveTarget
            ? utils_deep(
                target
            )
            : target
        ;
        //we need to keep the target preserved from here
        options.preserveTarget = true;
        //create the event emitters for both sides
        var emitterA = eventEmitter()
        , emitterZ = eventEmitter()
        //swap the event emitters between the sides
        , proxyAEvents = {
            "emit": emitterZ.emit
            , "on": emitterA.on
            , "once": emitterA.once
            , "off": emitterA.off
            , "has": emitterA.has
        }
        , proxyZEvents = {
            "emit": emitterA.emit
            , "on": emitterZ.on
            , "once": emitterZ.once
            , "off": emitterZ.off
            , "has": emitterZ.has
        }
        //create the watchers for both sides
        , proxyA = utils_proxy_createWatcher(
            internalTarget
            , proxyAEvents
            , options
        )
        , proxyZ = utils_proxy_createWatcher(
            internalTarget
            , proxyZEvents
            , options
        )
        ;

        return [
            proxyA
            , proxyZ
        ];
    }
}