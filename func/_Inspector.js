/**
* The function inspector inspects a function and return it's meta data
*    Only partially ES6 compliant. Any parameter declaration that uses parenthesis will cause issues.
*
* @factory
*/
function _Inspector(

) {
    /**
    * A collection of errors used in the factory
    * @function
    */
    var errors = {
        "invalid_format": "[Invalid Format] The function is not in a valid format"
        , "invalid_type": "[Invalid Type] The function parameter must be either a function or a string representing the function"
    }
    /**
    * RegEx used to extract the name, parameters, and body from a function
    * @property PARAM_LOOKUP
    * @private
    * @static
    */
    , FN_LOOKUP = /^[\s\r\n\t ]*function[\s\r\n\t ]*([\s\r\n\t ]*[A-z0-9_-]+[\s\r\n\t ]*)?[\s\r\n\t ]*\(((?:.|\r|\n)*?)\)[^{]*\{((?:.|\r|\n)*)\}[\s\r\n\t ]*$/i
    /**
    * RegEx used to remove the comments from a function
    * @property COM_PATT
    * @private
    * @static
    */
    , COM_PATT = /(?:\/\/.*)|(?:\/[*](?:.|\r?\n)*?[*]\/)/gm
    /**
    * RegEx used to remove line endings
    * @property
    * @private
    * @static
    */
    , LN_END_PATT = /\r?\n/g
    /**
    * A regexp pattern for removing leading and trailing whitespace
    * @property
    */
    , WS_PATT = /(?:^[\r\n \t]+)|(?:[\r\n \t]+$)/
    /**
    * A regexp pattern for splitting the parameters string
    * @property
    */
    , PARAM_PATT = /(?:^|[,](?!\\))[\t\r\n\s ]*([A-z_$][A-z0-9_$]+)(?:[\s\r\n\t ]*=[\s\r\n\t ]*([A-z0-9_$"'\{\}\[\]]+))?/g
    ;

    /**
    * @worker
    */
    return function FunctionInspector(fn, skipFail) {
        ///INPUT VALIDATION
        if (
            typeof fn !== "string"
            && typeof fn !== "function"
        ) {
            if (!!skipFail) {
                return;
            }
            throw new Error(`${errors.invalid_type}`);
        }
        ///END INPUT VALIDATION

        var fnValue = fn.toString()
        , fnText = fnValue
            .replace(COM_PATT, "")
            .replace(WS_PATT, "")
        , comms = fnValue.substring(0, (fnValue.length - fnText.length))
        , match = fnText.match(FN_LOOKUP)
        , name = !!match && match[1]
        , params = !!match && match[2]
        , body = !!match && match[3]
        , defaults = {};

        if (!match) {
            if (!!skipFail) {
                return;
            }
            throw new Error(`${errors.invalid_format}`);
        }

        //strip off leading and trailing whitespace
        params = params.replace(WS_PATT, "");

        //see if the result is an empty string
        if (params.length === 0) {
            params = [];
        }
        else {
            //split the result
            params = params.matchAll(PARAM_PATT);
            //convert to array
            params = Array.from(params);
            //remove comments and default value
            params = params.map(function (match) {
                var paramName = match[1]
                , paramDefault = match[2];
                if (paramDefault !== undefined) {
                    defaults[paramName] = paramDefault;
                }
                return paramName.replace(COM_PATT, "").trim();
            });
        }

        /**
        * An object that holds the function meta data
        * @type FunctionMeta
        * @member {array} params The array of function parameters
        * @member {string} name The name of the function, or 'anonymous' if it's omitted
        */
        return Object.create(null, {
            "comments": {
                "enumerable": true
                , "value": comms || ""
            }
            , "name": {
                "enumerable": true
                , "value": name
            }
            , "params": {
                "enumerable": true
                , "value": params
            }
            , "defaults": {
                "enumerable": true
                , "value": defaults
            }
            , "body": {
                "enumerable": true
                , "value": body
            }
            , "fnText": {
                "enumerable": true
                , "value": fnText
            }
        });
    };
}