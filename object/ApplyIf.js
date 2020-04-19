/**
 * Applies one objects members to another if they don't already exist
 * @function
 *  @param {Object} obj The object to get members from
 *  @param {Object} target The object to add the members to
 *  @return {Object}
 */
function applyIf(o, t) {
    if (!t) {
        t = {};
    }
    //if we have o then loop through it's properties
    if (!!o) {
        for (var k in o) {
            //if the target property is undefined
            if (t[k] === undefined && o[k] !== undefined) {
                t[k] = o[k];
            }
        }
    }
    return t;
}