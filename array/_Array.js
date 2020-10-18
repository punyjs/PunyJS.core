/**
*
* @function
*/
function _Array(
    utils_getType
) {

    /**
    * @worker
    */
    return Object.create(null, {
        "ofType": {
            "enumerable": true
            , "value": function ofType(v) {
                if (!Array.isArray(v)) {
                    return; //undefined means not array
                }
                if (v.length === 0) {
                    return null; //null means empty array
                }
                //start the type with the first item's type
                var type = utils_getType(v[0]);
                //inspect each member, return "mixed" if mismatched
                for(let i = 1, l = v.length; i < l; i++) {
                    if (utils_getType(v[i]) !== type) {
                        return "mixed";
                    }
                }

                return type;
            }
        }
    });
}