/**
* @factory
*/
function _Deep(
    is_object
    , is_array
    , weakMap
) {

    return Deep;

    /**
    * @worker
    */
    function Deep(value) {
        if (!is_object(value) && !is_array(value)) {
            return value;
        }
        //create a map to track multiple references of the same object
        var objectMap = new weakMap();

        return copyObjectValue(
            value
            , objectMap
        );
    }

    /**
    * @function
    */
    function copyObjectValue(value, objectMap) {
        if (!is_object(value) && !is_array(value)) {
            return value;
        }
        //see if the value has been copied already
        if (objectMap.has(value)) {
            return objectMap.get(value);
        }

        //create the copy, preserving the prototype for the object
        var copy = is_object(value)
            ? Object.create(
                Object.getPrototypeOf(value)
            )
            : []
        ;

        Object.keys(value)
        .forEach(
            function forEachPropKey(key) {
                var propValue = value[key];
                copy[key] = copyObjectValue(
                    propValue
                    , objectMap
                );
            }
        );
        //add a reference to the map
        objectMap.set(value, copy);

        return copy;
    }
}