/**
* Creates a deep copy of the object
* @function
*   @param {object} o The object to be copied
*   @returns {object} The new object
*/
function copy(o) {
    return JSON.parse(JSON.stringify(o));
}