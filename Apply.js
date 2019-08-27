/**
 * Applies one objects members to another, shallowly
 * @function
 *  @param {Object} obj The object to get members from
 *  @param {Object} target The object to add the members to
 *  @return {Object}
 */
function apply(o, t) {
    if (!t) {
        t = {};
    }
    //if we have o then loop through the members
    if (!!o) {
        for (var k in o) {
            //if the prop of o is not undefined
            if (o[k] !== undefined) {
                t[k] = o[k];
            }
        }
    }
    return t;
}