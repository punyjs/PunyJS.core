/**
* Updates o1 with any properties on o2 that don't exist on o1. If the property
* on o1 is an object and the property on o2 is an object, then it will run an
* update with those properties
* @function
*   @param {object} o1 The object that will be updated
*   @param {object} o2 The object that will be used to update
*   @returns {object}
*/
function update(o1, o2) {
    //loop through the first objects properties
    Object.keys(o1)
    .forEach(function forEachKey(key) {
        if (o2.hasOwnProperty(key)) {
            if (
                !!o1[key]
                && typeof o1[key] === "object"
                && o2[key]
                && typeof o2[key] === "object"
            ) {
                update(o1[key], o2[key]);
                return;
            }
        }
    });
    //loop through the second objects properties
    Object.keys(o2)
    .forEach(function forEachKey(key) {
        if (!o1.hasOwnProperty(key)) {
            o1[key] = o2[key];
        }
    });

    return o1;
}