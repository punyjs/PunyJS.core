/**
* The bi-directional watcher produces two proxies, proxyA and proxyZ. When a change is made to proxyA, listeners added to proxyZ will be fired, and vice versa.
* @factory
*/
function _BiDirectionalWatcher(
    utils_copy
    , utils_proxy_createWatcher
    , eventEmitter
    , errors
) {

    return BiDirectionalWatcher;

    /**
    * @worker
    */
    function BiDirectionalWatcher(externalTarget, options) {
        var target = utils_copy(
            externalTarget
        )
        , emitterA = eventEmitter()
        , emitterZ = eventEmitter()
        , proxyAEvents = Object.create(
            emitterA
            , {
                "emit": {
                    "enumerable": true
                    , "value": emitterZ.emit
                }
            }
        )
        , proxyZEvents = Object.create(
            emitterZ
            , {
                "emit": {
                    "enumerable": true
                    , "value": emitterA.emit
                }
            }
        )
        , proxyA = utils_proxy_createWatcher(
            target
            , proxyAEvents
            , options
        )
        , proxyZ = utils_proxy_createWatcher(
            target
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