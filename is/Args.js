/**
* Test the toString value for arguments
* @function
*   @param {any} v The value to be checked
*   @returns {boolean}
*/
function isArguments(v) {
    return Object.prototype.toString.call(v) === "[object Arguments]";
}