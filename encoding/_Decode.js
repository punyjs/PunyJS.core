/**
*
* @factory
*/
function _Decode(
    browser_atob
    , node_buffer
) {

    /**
    * @worker
    */
    return Object.create(null, {
        "fromBase64": {
            "enumerable": true
            , "value": function fromBase64(data) {
                if (!!node_buffer) {
                    return node_buffer
                        .from(data, "base64")
                        .toString("utf8")
                    ;
                }
                else {
                    return browser_atob(
                        data
                    );
                }
            }
        }
    });
}