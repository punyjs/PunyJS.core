/**
* Test the toString value for object
* @function
*   @param {any} v The value to be checked
*   @returns {boolean}
*/
function isObject(v) {
    return Object.prototype.toString.call(v) === "[object Object]";
}