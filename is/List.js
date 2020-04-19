/**
* Test the toString value for List
* @function
*   @param {any} v The value to be checked
*   @returns {boolean}
*/
function isList(v) {
    return Object.prototype.toString.call(v).indexOf("List") !== -1;
}