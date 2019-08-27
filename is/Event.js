/**
* Tests the value for Event in the toString result
* @function
*   @param {any} v The value to be checked
*   @returns {boolean}
*/
function isEvent(v) {
    return !!v && /^\[object\s[A-z]*Event\]$/g.test(Object.prototype.toString.call(v));
}