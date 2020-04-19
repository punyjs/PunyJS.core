/**
* Checks to see if the value is numeric
* @function
*   @param {any} v The value to test
*   @returns {boolean}
*/
function isNumeric(v) {
    return /^[0-9]+(?:[.][0-9]+)?$/.test(v);
}