/**
* Clears All the own properties off of an object
* @function
*   @param {object} o The object to be cleared
*/
function clear(o) {
    if (typeof o !== "object") {
        return;
    }
    Object.keys(o)
    .forEach(
        function clearKey(key) {
            if (typeof o[key] === "object") {
                clear(
                    o[key]
                );
            }
            else {
                delete o[key];
            }
        }
    );
}