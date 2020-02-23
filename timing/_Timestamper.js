/**
* Returns the precision time elapsed, in milliseconds, since the origin
* @factory
*   @singleton
*   @dependency {function} node_process ["+process"]
*   @dependency {funciton} browser_performance ["+performance"]
*/
function _Timestamper(
    node_process
    , browser_performance
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
    if (!!browser_performance) {
        origin = browser_performance.timeOrigin;
        worker = browserNow;
    }
    //node
    else if (!!node_process) {
        origin = Date.now();
        worker = nodeNow;
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
        return browser_performance.now() + origin;
    }
    /**
    * Returns the number of milliseconds since origin, using the node process uptime, adding the origin and converting it to miliseconds
    * @function
    */
    function nodeNow() {
        return node_process.uptime() * 1e-3 + origin;
    }
    /**
    * Fallback, low precision milliseconds since 01/01/1970.
    * @function
    */
    function fallbackNow() {
        return Date.now();
    }
}