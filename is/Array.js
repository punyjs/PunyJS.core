/**
* Checks a value to see if it is an array
* @function
*   @param {any} v The value to be checked
*   @returns {boolean}
*/
function isArray(v) {
    return Object.prototype.toString.call(v) === '[object Array]';
}