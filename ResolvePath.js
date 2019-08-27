/**
* Finds a value within an object using the path.
* @function
*   @param {string} path The path to look up
*   @param {object} scope The object to look in
*   @returns {iResolve}
* @interface iResolve
*   @param {boolean} found True if the path was found
*   @param {any} value The value found, or undefined
*   @param {object} parent The parent object that the property belongs to
*   @param {string|number} index The property name or index of the value
*   @param {array} path The path traversed, split into segments
*   @param {array} keys Any key names that were resolved in the process
*/
function resolvePath(path, scope) {
    var SPLIT_PATH = /[.]/g
    , INDXR_PATT = /\[(.+?)\]/g
    , LITERAL_PATT = /^[0-9]+$|^'.*'$|^".*"$/
    , STR_PATT = /^'.*'$|^".*"$/
    , NUM_PATT = /^[0-9]+(?:[.][0-9]+)?$/
    ;

    var orig = scope
    , found, ns, match, parent, index
    , indexKeys = []
    ;

    //pre-compile the indexers
    name = name.replace(INDXR_PATT, precompileIndexers);
    //split the name using the dot notation
    ns = name.split(SPLIT_PATH);
    //loop through the names
    found = ns.every(forEveryNsSegment);

    //Converts any indexer patterns in the path to dot notation, resolving any
    // non-literal values
    function precompileIndexers(match, val) {
       //if this is not a literal then resolve it
       if (!LITERAL_PATT.test(val)) {
           indexKeys.push(val);
           val = resolvePath(val, orig).value;
           if (val === undefined || val === null) {
               val = "";
           }
           if (NUM_PATT.test(val)) {
               val = '"' + val + '"';
           }
       }
       return "." + val + "";
   }

    //loops through every segment of the path
    function forEveryNsSegment(val, pos) {
        //if we still have a scope
        if (!!scope && !!val) {
            //remove any quotes
            if (STR_PATT.test(val)) {
                val = val.substring(1, val.length - 1);
            }

            parent = scope;
            index = val;

            if (typeof scope === "object") {
                if (val in scope) {
                    scope = scope[val];
                    return true;
                }
            }
        }

        scope = undefined;

        return false;
    }

    //return the scope
    return {
        "found": found
        , "value": scope
        , "parent": parent
        , "index": index
        , "path": ns
        , "keys": indexKeys
    };
}