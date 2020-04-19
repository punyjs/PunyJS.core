/**
* Test the toString value for maps, named node map
* @function
*   @param {any} v The value to be checked
*   @returns {boolean}
*/
function isMap(v) {
    return Object.prototype.toString.call(v).indexOf("Map") !== -1;
}