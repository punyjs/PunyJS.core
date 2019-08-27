/**
* Returns the precision time elapsed, in milliseconds, since the origin
* @factory
*   @singleton
*/
function _Timestamper(
    process
    , performance
    , origin
) {
    /**
    * Multiplier to convert nanosecond to milliseconds
    * @property
    *   @private
    */
    var NS_MS = 1e-6
    /**
    * Multiplier to convert seconds to milliseconds
    * @property
    *   @private
    */
    , SEC_MS = 1e-3
    /**
    * A reference to the chosen worker function
    * @property
    *   @private
    */
    , worker
    ;

    //set the function that will be used
    //browser
    if (!!performance) {
        worker = browserNow;
    }
    //node
    else if (!!process) {
        origin = calcNow() - (process.uptime() / SEC_MS);
        worker = nodeNow;
    }
    //fallback
    else {
        origin = origin || Date.now();
        worker = fallbackNow;
    }

    /**
    * @worker
    *   @returns {number} The timestamp in milliseconds
    */
    return worker;

    /**
    * Browser performance now
    * @function
    */
    function browserNow() {
        return performance.now();
    }
    /**
    * Node uptime
    * @function
    */
    function nodeNow() {
        return calcNow() - origin;
    }
    /**
    * Calculates the total nanoseconds for the returned hrtime array
    * @function
    */
    function calcNow() {
        var hr = process.hrtime();
        return hr[0] / SEC_MS + hr[1] * NS_MS;
    }
    /**
    * Fallback, low precision
    * @function
    */
    function fallbackNow() {
        return Date.now() - origin;
    }
}