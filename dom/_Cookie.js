/**
*
* @factory
*/
function _Cookie(
    dom_document
    , utils_regExp
) {
    /**
    * A regular expression pattern for parsing the cookie string
    * @property
    */
    var COOKIE_PATT = / ?([^=]+)=([^;]+);?/g
    /**
    * @constants
    */
    , cnsts = {
        "dayToMs": 24 * 60 * 60 * 1000
    }
    ;

    /**
    * @worker
    */
    return Object.create(
        null
        , {
            "get": {
                "enumerable": true
                , "value": getCookie
            }
            , "set": {
                "enumerable": true
                , "value": setCookie
            }
            , "delete": {
                "enumerable": true
                , "value": deleteCookie
            }
            , "export": {
                "enumerable": true
                , "value": exportCookies
            }
        }
    );

    /**
    * Looks for an instance of `name` in the document.cookie
    * @function
    */
    function getCookie(name) {
        var value;

        utils_regExp
        .getMatches(
            COOKIE_PATT
            , decodeURIComponent(dom_document.cookie)
        )
        .every(
            function everyCookie(match) {
                  if (match[1] === name) {
                      value = JSON.parse(match[2]);
                      return false;
                  }
                  return true;
            }
        );

        return value;
    }
    /**
    * @function
    */
    function exportCookies() {
        var cookies = {};

        utils_regExp
        .getMatches(
            COOKIE_PATT
            , decodeURIComponent(dom_document.cookie)
        )
        .forEach(
            function addEachCookie(match) {
                var name = match[1]
                , value = !!match[2]
                    ?  JSON.parse(match[2])
                    : null
                ;
                cookies[name] = value;
            }
        );

        return cookies;
    }
    /**
    * Sets the `name`/`value` pairs to the document cookie
    * @function
    */
    function setCookie(name, value, days, path) {
        var d, expires = "";

        path = path || "/";
        if (!!days) {
            d = new Date();
            d.setTime(d.getTime() + (days * cnsts.dayToMs));
            expires = "; expires=" + d.toUTCString();
        }

        value = JSON.stringify(value);

        dom_document.cookie = `${name}=${value}${expires};path=${path}`;
    }
    /**
    * Removes the cookie `name` from the document cookies
    * @function
    */
    function deleteCookie(name, path) {
        path = path || "/";
        //set the cookie name value to blank and expire it
        dom_document.cookie =
            `${name}=; expires=Thu, 01 Jan 1970 00:00:01 GMT;path=${path}`;
    }
}