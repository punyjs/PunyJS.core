/**
* A UUID generator, following RFC-4122
* @factory
* @singleton
*/
function _Uuid(
    timing_gregorianReform
    , uuidNode = "node"
) {
    var node =
        uuidNode.substring(0,4)
            .split("")
            .map(function mapChar(chr) {
                return chr.charCodeAt();
            })
        , version = "1";

    /**
    * @worker
    *   @param {boolean} [isId] If true, the GUID will not start with a number,
    *   so that it can be used as an id in a DOM
    *   @returns {string} The resulting UUID
    */
    return function Uuid(isId) {
        var uuid = []
        //get the ms since the gregorian reform
        , gregorianTimestamp = Date.now() + Math.abs(timing_gregorianReform)
        //convert the ms into 100ns intervals
        , intervals = (gregorianTimestamp * 1000000) / 100
        ;



    };
}