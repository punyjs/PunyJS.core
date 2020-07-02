/**
*
* @factory
*/
function _Encode(
    browser_btoa
    , node_buffer
) {


    /**
    * @worker
    */
    return Object.create(null, {
        "toBase64": {
            "enumerable": true
            , "value": function toBase64(data) {
                if (!!node_buffer) {
                    return node_buffer
                        .from(data)
                        .toString("base64")
                    ;
                }
                else {
                    return browser_btoa(
                        val
                    );
                }
            }
        }
    });
}