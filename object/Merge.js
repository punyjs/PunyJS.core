/**
* Merges two objects. When they share the same property and the value is a
* primitive, the value from the first object is used. If the shared property
* value is an object, then the objects are merged
* @function
*   @param {object} o1 The base object
*   @param {object} o2 The object to merge with
*   @returns {object} A new object containing
*/
function merge(o1, o2) {
    if (typeof o1 !== "object") {
        o1 = {};
    }

    var o3 = JSON.parse(JSON.stringify(o1));

    if (typeof o2 !== "object") {
        return o3;
    }

    //loop through the first objects properties
    Object.keys(o1)
    .forEach(function forEachKey(key) {
        if (o2.hasOwnProperty(key)) {
            if (Array.isArray(o1[key]) && Array.isArray(o2[key])) {
                o3[key] = o1[key].concat(o2[key]);
                return;
            }
            if (
                !!o1[key]
                && typeof o1[key] === "object"
                && !!o2[key]
                && typeof o2[key] === "object"
            ) {
                o3[key] = merge(o1[key], o2[key]);
                return;
            }
        }
    });
    //loop through the second objects properties
    Object.keys(o2)
    .forEach(function forEachKey(key) {
        if (!o1.hasOwnProperty(key)) {
            if (o2[key] === "object") {
                o3[key] = JSON.parse(JSON.stringify(o2[key]));
            }
            else {
                o3[key] = o2[key];
            }
        }
    });

    return o3;
}