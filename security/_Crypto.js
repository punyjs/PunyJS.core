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
    * Switch identifying if this is using the browser components
    * @property
    */
    var isBrowser = !!browser_crypto
    ;

    /**
    * @worker
    */
    return Object.create(null, {
        "fillRandomBytes": {
            "enumerable": true
            , "value": fillRandomBytes
        }
        , "sha1": {
            "enumerable": true
            , "value": sha1
        }
        , "sha256": {
            "enumerable": true
            , "value": sha1
        }
    });

    /**
    * @function
    */
    function fillRandomBytes(typedArray, ...params) {
        if (isBrowser) {
            browser_crypto.getRandomValues(typedArray);
        }
        else {
            node_crypto.randomFillSync(typedArray, params[0], params[1]);
        }
    }
    /**
    * @function
    */
    function sha1(data) {
        return createHash(
            data
            , isBrowser
                ? "SHA-1"
                : "sha1"
        );
    }
    /**
    * @function
    */
    function sha256(data) {
        return createHash(
            data
            , isBrowser
                ? "SHA-256"
                : "sha256"
        );
    }
    /**
    * @function
    */
    function createHash(data, algorithm) {
        if (isBrowser) {
            return browser_crypto.subtle.digest(
                algorithm
                , data
            );
        }
        else {
            var hash = node_crypto.createHash(
                algorithm
            )
            .update(
                data
            );

            return hash.digest();
        }
    }
}