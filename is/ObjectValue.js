/**
* Tests a value to see if it ultimately is chaned from the Object prototype.
* @function
*   @param {any} v The value to be checked
*   @returns {boolean}
*/
function isObjectValue(v) {
    if (!v) {
        return false;
    }
    if (!!v && typeof v === "object") {
        return true;
    }
    return false;
}