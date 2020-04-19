/**
* Determines the type of a value `o`, if an object it uses the second part of
* the toString
* @function getType
*   @param {any} o The value to be inspected
*   @returns {string} The string value representing o's type
*/
function getType(o) {
    return Object.prototype.toString
        .call(o)
        .substring(8)
        .replace("]", "")
        .toLowerCase();
}