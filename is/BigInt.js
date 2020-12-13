/**
* Checks a value to see if it is a bigint
* @function
*   @param {any} v The value to be checked
*   @returns {boolean}
* @naming
*   @alias is_bigint
*/
function isBigInt(v) {
    return typeof v === "bigint";
}