/**
* Test the toString value for RegExp
* @function
*   @param {any} v The value to be checked
*   @returns {boolean}
*/
function isRegExp(v) {
    return Object.prototype.toString.call(v) === "[object RegExp]";
}