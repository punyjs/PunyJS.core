/**
*
* @factory
*/
function _HttpMessage(
    is_string
    , is_object
    , net_http_statusCodes
) {
    /**
    * A regular expression pattern for parsing the http request message first line
    * @property
    */
    var REQ_FIRST_LINE_PATT = /^([A-Z]+) ([^ ]+) ([A-Z]+\/[0-9.]+)$/
    /**
    * A regular expression pattern for parsing the http response message status line
    * @property
    */
    , RESP_STATUS_LINE_PATT = /^([A-Z]+\/[0-9.]+) ([0-9]+)(?: (.*))?$/
    /**
    * @alias
    */
    , statusCodes = net_http_statusCodes
    ;

    /**
    * @worker
    */
    return Object.create(null, {
        "encodeHttpRequest": {
            "enumerable": true
            , "value": encodeHttpRequest
        }
        , "decodeHttpRequest": {
            "enumerable": true
            , "value": decodeHttpRequest
        }
        , "encodeHttpResponse": {
            "enumerable": true
            , "value": encodeHttpResponse
        }
        , "decodeHttpResponse": {
            "enumerable": true
            , "value": decodeHttpResponse
        }
    });

    /**
    * Encodes a HTTP request to a string in the HTTP Message format.
    * @function
    */
    function encodeHttpRequest(requestObj) {
        var method = responseObj.method || "GET"
        , target = responseObj.target || "/"
        , version = responseObj.version || "HTTP/1.1"
        , requestLine = `${method} ${target} ${version}`
        , headersText = stringifyHeaders(
            responseObj.headers
        )
        , bodyText = stringifyBody(
            responseObj.body
        )
        , message = `${requestLine}\r\n${headersText}`
        ;
        if (!!bodyText) {
            message = `${message}\r\n\r\n${body}`;
        }

        return message;
    }
    /**
    * Decodes a HTTP request message string to an object
    * @function
    */
    function decodeHttpRequest(requestMessage) {
        //force the message to a string (for node Buffers)
        if (!is_string(requestMessage)) {
            requestMessage = `${requestMessage}`;
        }
        var lines = requestMessage.split("\r\n")
        //extract and parse the first line
        , requestLine = lines.shift()
        , [, method, target, version]
            = requestLine.match(REQ_FIRST_LINE_PATT)
        //extract and parse the headers
        , blankLineIndex = lines.indexOf("\r\n\r\n")
        , headerLines = lines.slice(0, blankLineIndex)
        , headers = parseHeaders(
            headerLines
        )
        //extract and parse the body
        , bodyLines = lines.slice(blankLineIndex)
        , body = parseBody(
            bodyLines
        )
        ;

        //create the request message object with the first line properties, headers and body
        return {
            "method": method
            , "target": target
            , "version": version
            , "headers": headers
            , "body": body
        };
    }
    /**
    * Encodes a HTTP response to a string in the HTTP Message format
    * @function
    */
    function encodeHttpResponse(responseObj) {
        var version = responseObj.version
            || "HTTP/1.1"
        , statusCode = responseObj.statusCode
            || "500"
        , statusText = responseObj.statusText
            || statusCodes[responseObj.statusCode]
            || "Server Error"
        , statusLine = `${version} ${statusCode} ${statusText}`
        , headersText = stringifyHeaders(
            responseObj.headers
        )
        , bodyText = stringifyBody(
            responseObj.body
        )
        , message = `${statusLine}\r\n${headersText}\r\n\r\n${bodyText}`
        ;

        return message;
    }
    /**
    * Decodes a HTTP response message string to an object
    * @function
    */
    function decodeHttpResponse(responseMessage) {
        //force the message to a string (for node Buffers)
        if (!is_string(responseMessage)) {
            responseMessage = `${responseMessage}`;
        }
        var lines = responseMessage.split("\r\n")
        //extract and parse the first line
        , statusLine = lines.shift()
        , [, version, statusCode, statusText]
            = statusLine.match(RESP_STATUS_LINE_PATT)
        //extract and parse the headers
        , blankLineIndex = lines.indexOf("\r\n\r\n")
        , headerLines = blankLineIndex !== -1
            ? lines.slice(0, blankLineIndex)
            : lines
        , headers = parseHeaders(
            headerLines
        )
        //extract and parse the body
        , bodyLines = blankLineIndex !== -1
            ? lines.slice(blankLineIndex)
            : null
        , body = parseBody(
            bodyLines
        )
        ;
        //create the response message object with the status line properties, headers and body
        return {
            "version": version
            , "statusCode": statusCode
            , "statusText": statusText
            , "headers": headers
            , "body": body
        };
    }
    /**
    * @function
    */
    function parseHeaders(headerLines) {
        var headers = {};

        headerLines.forEach(function forEachHeaderLine(headerLine) {
            if (!headerLine) {
                return;
            }
            var keyVal = headerLine.split(":")
            , key = keyVal[0].toLowerCase()
            , val = keyVal[1]
            ;
            if (val !== undefined) {
                val = val.trim();
            }
            headers[key] = val;
        });

        return headers;
    }
    /**
    * @function
    */
    function stringifyHeaders(headers) {
        if (!is_object(headers)) {
            return;
        }
        return Object.keys(headers)
        .map(function mapHeaderLine(headerKey) {
            return `${headerKey}: ${headers[headerKey]}`;
        })
        .join("\r\n")
        ;
    }
    /**
    * @function
    */
    function parseBody(bodyLines) {

    }
    /**
    * @function
    */
    function stringifyBody(body) {
        return "";
    }
}