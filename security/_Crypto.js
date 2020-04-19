/**
* The crypto dependencies is a wrapper to expose both Web and Node crypto APIs using one standard.
* @factory
* @interface security_crypto
*   @property {function} fillRandomBytes
*/
function _Crypto(
    promise
    , browser_crypto
    , node_crypto
    , node_buffer
) {

    /**
    * @worker
    */
    return Object.create(null, {
        "fillRandomBytes": {
            "enumerable": true
            , "value": fillRandomBytes
        }
    });

    /**
    * @function
    */
    function fillRandomBytes(typedArray, ...params) {
        if (!!browser_crypto) {
            browser_crypto.getRandomValues(typedArray);
        }
        else {
            node_crypto.randomFillSync(typedArray, params[0], params[1]);
        }
    }
}