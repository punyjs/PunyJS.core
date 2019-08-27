/**
* Checks to see if the key is a property of the object
* @function
*   @param {object} o The object to be checked
*   @param {string} k The key to find in the object
*   @returns {boolean}
*/
function isPropOf(o, k) {
    return typeof o === "object" && o.hasOwnProperty(k) || false;
}