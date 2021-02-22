/**
* A function for ensuring a property exists regardless of its nested depth.
* @function
*   @param {string} jpath The path to ensure exists in the `data`
*   @param {object} data The object that must have the `jpath`
*/
function Ensure(jpath, data) {
    var SPLIT_PATH = /[.]/g
    , INDXR_PATT = /[\[\]]/g
    , NUM_PATT = /^[0-9]+$/
    ;

    //convert indexers [indexer] to dots
    var pathNoIndexers = jpath.replace(INDXR_PATT, ".")
    , pathParts = pathNoIndexers.split(SPLIT_PATH)
    , lastIndx = pathParts.length - 1
    , scope = data;

    //loop through the parts of the path and create the
    pathParts.every(function everyPathPart(part, indx) {
        //the scope should be an object if it's not the last part of the jpath, if not that means the property already exists but cannot be extended
        if (typeof scope !== "object" && indx < lastIndx) {
            throw new Error(
                `Cannot use property ${part} as an object because it already exists as a primitive.`
            );
        }
        //if the scope is an array, let's use the part as a number
        if (Array.isArray(scope) && NUM_PATT.test(part)) {
            part = parseInt(part);
        }
        //if the scope does not have the property `part` then create it
        if (!scope.hasOwnProperty(part)) {
            //if this is the last part then make it `null`
            if (indx === lastIndx) {
                scope[part] = null;
                return;
            }
            //otherwise make it an object
            else {
                scope[part] = {};
            }
        }
        //set the scope to the scope part
        scope = scope[part];

        return true;
    });

    return {
        "parent": scope
        , "index": pathParts[lastIndx]
    };
}