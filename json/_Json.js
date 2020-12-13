/**
* This json utility provides cyclic object stringification and parsing without data loss
* @factory
*/
function _JSON(
    is_objectValue
    , is_array
) {

    return Object.create(
        null
        , {
            "decycle": {
                "enumerable": true
                , "value": decycleStringify
            }
            , "retrocycle": {
                "enumerable": true
                , "value": retrocycleParse
            }
        }
    );

    /**
    * @function
    */
    function decycleStringify(value, replacer) {
        var refs = new WeakMap();
        //replace all cyclic references
        if (is_objectValue(value)) {
            refs.set(value, "$");
            value = decycleObject(
                refs
                , value
                , "$"
            );
        }
        return JSON.stringify(value, replacer);
    }
    /**
    * @function
    */
    function decycleObject(refs, obj, parentPath) {
        var replacement = is_array(obj)
            ? []
            : {}
        ;

        Object.keys(obj)
        .forEach(
            function forEachKey(key) {
                var value = obj[key]
                , path
                ;
                if (is_objectValue(value)) {
                    if (refs.has(value)) {
                        value = {"$$ref$$": `${refs.get(value)}`};
                    }
                    else {
                        path = `${parentPath}.${key}`;
                        refs.set(value, path);
                        value = decycleObject(
                            refs
                            , value
                            , path
                        );
                    }
                }
                replacement[key] = value;
            }
        )

        return replacement;
    }
    /**
    * @function
    */
    function retrocycleParse(str) {
        //hydrate the object
        var obj = JSON.parse(str)
        , refs = {
            "$": obj
        }
        ;

        return retrocycleObject(
            obj
            , refs
            , "$"
        );
    }
    /**
    * @function
    */
    function retrocycleObject(obj, refs, parentPath) {
        Object.keys(obj)
        .forEach(
            function forEachKey(key) {
                var value = obj[key], path;
                if (is_objectValue(value)) {
                    path = `${parentPath}.${key}`;
                    if (value.hasOwnProperty("$$ref$$")) {
                        obj[key] = refs[value["$$ref$$"]];
                    }
                    else {
                        refs[path] = value;
                        retrocycleObject(
                            value
                            , refs
                            , parentPath
                        );
                    }
                }
            }
        );

        return obj;
    }
}