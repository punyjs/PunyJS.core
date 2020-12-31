/**
* A watched object is a proxy object with ability to fire callback handlers when a property is accessed, modified, deleted, a constructor is execued or a function is executed.
* @options
*   @property {boolean} preserveTarget When set to true, the target will not be deep copied. Generally, to remove the possibility of inconsistencies, the target object is deep copied, but this can destroy certain object types that can't be deep copied -- such as an element or error -- for this corner case, with much caution not to modify the target directly, this can be turned off. Default, false.
*   @property {array} traps An array of traps to use. Default, ["set"].
*   @property {array} includeDetails An array of trap names that will include detailed information. Default, ["set"]
* @factory
*/
function _Watcher(
    utils_proxy_createWatcher
    , eventEmitter
) {

    return Watcher;

    /**
    * @worker
    */
    function Watcher(target, options) {
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

        return utils_proxy_createWatcher(
            target
            , eventEmitter()
            , options
        );
    }
}