/**
* Test the toString value for object
* @function
*   @param {any} v The value to be checked
*   @returns {boolean}
* @naming
*   @alias is_object
*/
function isObject(v) {
    return Object.prototype.toString.call(v) === "[object Object]";
}