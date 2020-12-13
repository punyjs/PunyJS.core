/**
* Test the obj to see if it is a Promise
* @function
*   @param {any} v The value to be checked
*   @returns {boolean}
*/
function isPromise(v) {
    return !!v
        && typeof v === "object"
        && (
            v instanceof Promise
            || Object.getPrototypeOf(v) === Promise
            || Promise.resolve(v) === v
        )
        || false
    ;
}