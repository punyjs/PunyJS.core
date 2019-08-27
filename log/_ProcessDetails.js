/**
* @factory
*   @dependency idGenerator TruJS.core.data._IdGenerator
*/
function _ProcessDetails(
    idGenerator
) {

    /**
    * @worker
    *   @param {string} name
    *   @param {string} location
    *   @param {string} parent
    */
    return function ProcessDetails(name, location, parent) {
        //create a detail object for the reporter
        return {
            "id": idGenerator()
            , "name": name
            , "location": location
            , "parent": parent
            , "level": !!parent
                ? parent.level + 1
                : 1
        };
    };
}