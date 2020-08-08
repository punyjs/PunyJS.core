/**
* Checks a value to see if it is an iterable
* @function
*   @param {any} v The value to be checked
*   @returns {boolean}
*/
function isIterable(v) {
    return !!v && typeof v === "object" && typeof v.next === "function";
}