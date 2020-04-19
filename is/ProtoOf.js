/**
* Checks to see if the key `k` is a prototype property of object `o`
* @function
*   @param {object} o The object to test
*   @param {string} k The key to test for proto
*   @returns {boolean}
*/
function isPrototypeKey(o, k) {
    if (!Object.prototype.hasOwnProperty.apply(o, [k]) && k in o) {
        return true;
    }
    return false;
}