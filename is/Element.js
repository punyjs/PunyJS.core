/**
* Tests the value for Element in the toString result
* @function
*   @param {any} v The value to be checked
*   @returns {boolean}
*/
function isElement(v) {
    return !!v && /^\[object\s((?:HTML|SVG)[A-z]*Element|Text)\]$/.test(Object.prototype.toString.call(v));
}