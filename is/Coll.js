/**
* Test the toString value for Collection
* @function
*   @param {any} v The value to be checked
*   @returns {boolean}
*/
function isCollection(v) {
    return Object.prototype.toString.call(v).indexOf("Collection") !== -1;
}