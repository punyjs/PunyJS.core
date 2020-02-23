/**
* The http file loader acts like the fs file loader except it uses the XMLHttpRequest API
* @factory
*/
function _FileLoader(
    promise
    , httpRequest
    , is_object
    , errors
) {

    /**
    * @constants
    */
    var cnsts = {
        "defaultResponseType": "text"
        , "defaultRequestTimeoutMs": 60 * 2 * 1000
    };

    /**
    * @worker
    *   @param {string} url The full url that points to the file resource
    *   @param {object} [options] A collection of options for the request
    *       @property {string} [responseType]
    *       @property {object} [headers] A collection of header keys and values
    *       @property {string} [overrideMimeType] The string value used when calling overrideMimeType
    *       @property {number} [timeout] The number of milliseconds to wait for a response before throwing the timout event
    */
    return function FileLoader(url, options) {
        return new promise(
            startRequest.bind(null, url, options)
        );
    };

    /**
    * @function
    */
    function startRequest(url, options, resolve, reject) {
        try {
            var request = setupRequest(options, resolve, reject);
            //opend and send the request
            request.open(
                "GET"
                , url
            );
            //send the request
            request.send();
        }
        catch(ex) {
            reject(ex);
        }
    }
    /**
    * @function
    */
    function setupRequest(options, resolve, reject) {
        //create the http request
        var request = new httpRequest();

        //set the response type
        request.responseType =
            !!options && options.responseType
            || cnsts.defaultResponseType;

        //set the headers
        if (!!options && is_object(options.headers)) {
            Objace.keys(options.headers)
            .forEach(function forEachHeaderKey(key) {
                request.setRequestHeader(
                    key
                    , options.headers[key]
                );
            });
        }

        //see if we're overriding the mime type
        if (!!options && options.hasOwnProperty("overrideMimeType")) {
            request.overrideMimeType(
                options.overrideMimeType
            );
        }

        request.timeout =
            !!options && options.timeout
            || cnsts.defaultRequestTimeoutMs;

        //wire listeners
        addLoadListener(request, resolve, reject);
        addTimeoutListener(request, reject);
        addErrorListener(request, reject);

        return request;
    }
    /**
    * @function
    */
    function addLoadListener(request, resolve, reject) {
        request.addEventListener("load", function handleLoad() {
            var results = request.response;

            //anything other than 200 is an error
            if (request.status !== 200) {
                reject(
                    new Error(`${errors.http_invalid_response} (${request.status}: ${request.statusText} -> ${request.responseType})`)
                );
                return;
            }

            resolve(results);
        });
    }
    /**
    * @function
    */
    function addTimeoutListener(request, reject) {
        request.addEventListener("timeout", function handleLoadEnd() {
            reject(
                new Error(`${errors.http_timeout}`)
            );
        });
    }
    /**
    * @function
    */
    function addErrorListener(request, reject) {
        request.addEventListener("error", function handleError() {
            reject(
                new Error(`${errors.http_failed}`)
            );
        });
    }
}