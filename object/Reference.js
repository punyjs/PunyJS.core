/**
* Similar to `Lookup` this function finds a value in `data` using the `jpath`, traversing the `data` structure for each segment in the `jpath`.
* @function
*/
function Reference(jpath, data) {
    var SPLIT_PATH = /[.]/g
    , INDXR_PATT = /\[(.+?)\]/g
    , LITERAL_PATT = /^([0-9]+)$|^'(.*)'$|^"(.*)"$/
    , STR_PATT = /^'.*'$|^".*"$/
    , NUM_PATT = /^[0-9]+(?:[.][0-9]+)?$/
    ;

    //return the reference object
    return reference(jpath, data);

    /**
    * @function
    */
    function reference(jpath, data) {
        try {
            //start the reference object
            var ref = {
                "found": false
                , "value": data
                , "parent": undefined
                , "index": undefined
                , "jpath": jpath
                , "keys": []
            }
            //precompile any indexers that are not literals, and convert to dot notation
            , pathPrecompiled = jpath.replace(
                INDXR_PATT
                , preCompileIndexer.bind(null, ref)
            )
            //split the path int segments
            , pathSegments = pathPrecompiled.split(SPLIT_PATH)
            ;
            //loop through the jpath segments, traversing data for each path segment
            ref.found =
                pathSegments.every(
                    everyJPathSegment.bind(null, ref)
                );
        }
        catch(ex) {
            ref.value = undefined;
            ref.exception = ex;
        }

        if (!ref.found) {
            ref.value = undefined;
            ref.parent = undefined;
            ref.index = undefined;
        }

        return ref;
    }
    /**
    * @function
    */
    function preCompileIndexer(ref, fullValue, value) {
        var match;
        //if this is a literal then get the value without any quotes
        if (!!(match = LITERAL_PATT.test(value))) {
            if (!!match[2]) {
                value = match[2];
            }
            else if (!!match[3]) {
                value = match[3];
            }
        }
        //otherwise let's resolve it from the data like it's a jpath
        else {
            //add this path to the keys list
            ref.keys.push(value);
            //get a reference to the object; creating the paths
            value = reference(value, data).value;
        }
        return "." + val;
    }
    /**
    * @function
    */
    function everyJPathSegment(ref, pathSegment) {
        //the value now becomes the parent
        ref.parent = ref.value;
        //the current parent should be an object
        if (typeof ref.parent !== "object") {
            return false;
        }
        //if the parent is an array, let's convert the path segment to a number
        if (Array.isArray(ref.parent) && NUM_PATT.test(pathSegment)) {
            pathSegment = parseInt(pathSegment);
        }

        if (!(pathSegment in ref.parent)) {
            return false;
        }

        ref.index = pathSegment;
        ref.value = ref.parent[ref.index];

        return true;
    }
}