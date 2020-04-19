/**
* A simple function for finding a value in nested objects using a `jpath` in dot notation
* @function
*/
function Lookup(jpath, data) {
    var SPLIT_PATH = /[.]/g
    , INDXR_PATT = /[\[\]]/g
    , NUM_PATT = /^[0-9]+$/
    ;

    //convert indexers [indexer] to dots
    var pathNoIndexers = jpath.replace(INDXR_PATT, ".")
    , pathSplit = pathNoIndexers.split(SPLIT_PATH)
    , scope = data;

    //loop through the parts of the path
    pathSplit.every(function everyPart(part) {
        //the scope should be an object
        if (typeof scope !== "object") {
            scope = undefined;
            return false;
        }
        //if the scope is an array, let's use the part as a number
        if (Array.isArray(scope) && NUM_PATT.test(part)) {
            part = parseInt(part);
        }
        //set the scope
        scope = scope[part];

        return true;
    });

    return scope;
}