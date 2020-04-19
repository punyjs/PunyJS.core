/**
* Determines the type of a value `o`, if an object it uses the second part of
* the toString
* @function getType
*   @param {any} o The value to be inspected
*   @returns {string} The string value representing o's type
*/
function getType(o) {
    var type = typeof o, isPromise;
    if (!!o && type === "object") {
        //test for promise
        isPromise = o instanceof Promise ||
            Object.getPrototypeOf(o) === Promise ||
            Promise.resolve(o) === o ||
            false;
        if (isPromise) {
            type = "promise";
        }
        else {
            type = Object.prototype.toString.call(o)
                .replace("[object ", "")
                .replace("]", "");
        }
    }
    return type.toLowerCase();
}