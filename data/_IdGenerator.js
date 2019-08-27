/**
* @factory
*/
function _IdGenerator(

) {
    /**
    * A collection of defaults
    * @property
    *   @private
    */
    var cnsts = {
        "simpleIdPadding": "0".repeat(12)
    }
    /**
    * Used for the simple id, a volital runtime numeric increment
    * @property
    *   @private
    */
    , lastSimpleId = 0
    ;

    /**
    * @function
    */
    function generateSimpleId() {
        var id = (++lastSimpleId).toString()
        , padding = cnsts.simpleIdPadding.substring(
            0
            , cnsts.simpleIdPadding.length - id.length
        );

        return padding + id;
    }

    /**
    * @worker
    */
    return function IdGenerator(config) {
        if (!config) {
            return generateSimpleId();
        }
    };
}