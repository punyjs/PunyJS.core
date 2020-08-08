/**
* Tests String, Array, or Object to see if it's empty
* @function
*   @param {any} v The value to be checked
*   @returns {boolean}
*/
function isEmpty(v) {
    if (v === undefined || v === null) {
        return true;
    }
    else if (Array.isArray(v) || typeof v === "string") {
        return v.length === 0;
    }
    else if (!!v && typeof v === "object") {
        for (var key in v) {
            return false;
        }
        return true;
    }
    return false;
}