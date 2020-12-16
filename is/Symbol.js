/**
* Test a value to see if it is a symbol
* @function
*   @param {any} v The value to be checked
*   @returns {boolean}
*/
function isSymbol(v) {
    return typeof v === "symbol";
}