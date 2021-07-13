/**
*
* @factory
*/
function _DelayedPromise(
    promise
    , setTimeout
) {

    return DelayedPromise;

    /**
    * @worker
    */
    function DelayedPromise(delayMs) {
        return new promise(
            function delayPromise(resolve) {
                setTimeout(
                    function resolveDelayedPromise() {
                        resolve();
                    }
                    , delayMs || 10
                )
            }
        );
    }
}