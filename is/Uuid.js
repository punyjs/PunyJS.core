/**
* @script
*/
(function () {
    /**
    * A regular expression pattern for testing to see if a string is a uuid
    * @property
    */
    var UUID_PATT = /^[0-9abcdef]{8}-[0-9abcdef]{4}-[0-9abcdef]{4}-[0-9abcdef]{4}-[0-9abcdef]{12}$/i;
    /**
    * Tests the value to see if it fits the format of a uuid
    * @function
    */
    function isUuid(value) {
        if (typeof value === "string" && value.length === 36) {
            return !!value.match(UUID_PATT)
        }
        return false;
    }

    return isUuid;
})()