/**
* Tests the value for Error in the toString result
* @function
*   @param {any} v The value to be checked
*   @returns {boolean}
*/
function isError(v) {
    return !!v && /^\[object\s([A-z]*Error|[A-z]*Exception)\]$/g.test(Object.prototype.toString.call(v));
}