/**
* Returns the precision time elapsed, in milliseconds, since the origin
* @factory
*   @singleton
*   @dependency {function} node_process ["+process"]
*/
function _Timestamper(
    performance
) {
    /**
    * The
    * @property
    */
    var origin
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
        origin = performance.timeOrigin;
        worker = browserNow;
    }
    //fallback
    else {
        worker = fallbackNow;
    }

    /**
    * @worker
    *   @returns {number} The timestamp in milliseconds
    */
    return worker;

    /**
    * Returns the number of milliseconds since origin, using the browser performance now and adding the origin.
    * @function
    */
    function browserNow() {
        return performance.now() + origin;
    }
    /**
    * Fallback, low precision milliseconds since 01/01/1970.
    * @function
    */
    function fallbackNow() {
        return Date.now();
    }
}