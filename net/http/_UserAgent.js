/**
* @factory
* @examples
    IE11 =  Mozilla/5.0 (compatible, MSIE 11, Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko
            Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; AS; rv:11.0) like Gecko
    IE10 =  Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/6.0)
            Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/5.0)
            Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/4.0; InfoPath.2; SV1; .NET CLR 2.0.50727; WOW64)
    Moz =   Mozilla/5.0 (Windows; U; Windows NT 6.1; rv:2.2) Gecko/20110201
            Mozilla/5.0 (Windows; U; Windows NT 6.1; it; rv:2.0b4) Gecko/20100818
    Cr =    Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36
            Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.1 Safari/537.36
            Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.0 Safari/537.36
    FF =    Mozilla/5.0 (Windows NT 6.1; WOW64; rv:40.0) Gecko/20100101 Firefox/40.1
            Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10; rv:33.0) Gecko/20100101 Firefox/33.0
            Mozilla/5.0 (X11; Linux i586; rv:31.0) Gecko/20100101 Firefox/31.0
    ND =    Mozilla/5.0 (X11; Linux i686; Ubuntu/14.10) NodeJS/12.1.20
    OP =    Opera/9.80 (X11; Linux i686; Ubuntu/14.10) Presto/2.12.388 Version/12.16
            Opera/9.80 (Windows NT 6.0) Presto/2.12.388 Version/12.14
            Mozilla/5.0 (Windows NT 6.0; rv:2.0) Gecko/20100101 Firefox/4.0 Opera 12.14
            Opera/9.80 (Macintosh; Intel Mac OS X 10.6.8; U; de) Presto/2.9.168 Version/11.52
            Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36 OPR/39.0.2256.71
    IEm =   Mozilla/5.0 (compatible; MSIE 9.0; Windows Phone OS 7.5; Trident/5.0; IEMobile/9.0)
    OPm =   Opera/12.02 (Android 4.1; Linux; Opera Mobi/ADR-1111101157; U; en-US) Presto/2.9.201 Version/12.02
            Opera/9.80 (Linux i686; Opera Mobi/1040; U; en) Presto/2.5.24 Version/10.00
            Opera/9.80 (Macintosh; Intel Mac OS X; Opera Mobi/3730; U; en) Presto/2.4.18 Version/10.00
    BB =    Mozilla/5.0 (BlackBerry; U; BlackBerry 9900; en) AppleWebKit/534.11+ (KHTML, like Gecko) Version/7.1.0.346 Mobile Safari/534.11+
    AND =   Mozilla/5.0 (Linux; U; Android 4.0.3; ko-kr; LG-L160L Build/IML74K) AppleWebkit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30
            Mozilla/5.0 (Linux; U; Android 2.3; en-us) AppleWebKit/999+ (KHTML, like Gecko) Safari/999.9

    Other = Googlebot/2.1 (+http://www.google.com/bot.html)
            Galaxy/1.0 [en] (Mac OS X 10.5.6; U; en)
            Mozilla/4.0 (compatible; MSIE 6.0; Windows 95; PalmSource; Blazer 3.0) 16; 160x160
            Mozilla/5.0 (Macintosh; U; Intel Mac OS X; en) AppleWebKit/418.9.1 (KHTML, like Gecko) Safari/419.3 TeaShark/0.8
*/
function _UserAgent(
    browser_userAgent
    , node_process
    , node_os
    , net_http_userAgentRules
    , utils_regex
    , is_nill
) {
    /**
    * A regular expression pattern for parsing the user agent string
    * @property
    */
    var AGENT_PATT = /((?:[^\s\/\(]+)(?:(?:(?:\/)(?:[^\s\(\/]*))|(?:(?:\s)(?:[0-9\.]+)))?)|(?:(?:\s)?(?:(?:\()(?:[^\(\)]+))*(?:(?:\s)*(?:\()([^\(\)]*)(?:\))(?:\s)*)+(?:(?:[^\(\)\s]*)(?:\)))?)/g
    /**
    * A container to house the parsed user agent values
    * @property
    */
    , agent = {
        "mozilla": null
        , "browser": {}
        , "system": {}
        , "platform": {}
        , "other": {}
        , "raw": null
    }
    /**
    * A container to house parts of the user agent during processing
    * @property
    *   @private
    */
    , tokens = {}
    /**
    * @alias
    */
    , userAgentRules = net_http_userAgentRules
    ;

    initializeAgent();

    /**
    * @worker
    */
    return agent;
    /**
    * @function
    */
    function initializeAgent() {
        var agentText = browser_userAgent
        , platformAgentText
        , nodeVersion;
        if (is_nill(agentText)) {
            platformAgentText = getPlatformText();
            nodeVersion = getVersionText();
            agentText = `Mozilla/5.0 (${platformAgentText}) ${nodeVersion}`;
        }
        parseUserAgent(
            agentText
        );
        //no more changes
        Object.freeze(agent);
    }
    /**
    * @function
    */
    function getPlatformText() {
        return `${node_os.type()};${node_os.release()};${node_os.platform()};${node_os.arch()};`;
    }
    /**
    * @function
    */
    function getVersionText() {
        return Object.keys(node_process.versions)
        .map(function forEachVerKey(verKey) {
            return `${verKey}/${node_process.versions[verKey]}`;
        })
        .join(" ");
    }
    /**
    * @function
    */
    function parseUserAgent(agentText) {
        agent.raw = standardizeUserAgentText(
            agentText
        );
        //parse the text with the reg exp
        var matches = utils_regex.getMatches(
            AGENT_PATT
            , agent.raw
        );

        //loop through the matches
        for (let i = 0, l = matches.length; i < l; i++) {
            if (!is_nill(matches[i][1])) {
                parseGroup1(
                    matches[i][1]
                    , i
                );
            }
            else {
                parseGroup2(
                    matches[i][2]
                    , i
                );
            }
        }
        //browser
        detectBrowser();
    }
    /**
    * @function
    */
    function standardizeUserAgentText(agentText) {
        return agentText
            .replace('KHTML like Gecko', 'KHTML, like Gecko')
            //other rules go here
        ;
    }
    /**
    * @function
    */
    function parseGroup1(str, indx) {
        //we are expecting format: name/version
        var resa = str.split('/');
        tokens[resa[0].toLowerCase()] = resa[1];
        //if this is the first match then this is the mozilla
        if (indx == 0 && resa[0] == "Mozilla") {
            agent.mozilla = resa[1];
        }
        //if this is the 3rd match then this is the platform
        else if (indx == 2) {
            agent.platform[resa[0]] = resa[1];
        }
        else {
            agent.other[resa[0]] = resa[1];
        }
   }
    /**
   * @function
   */
    function parseGroup2(str, indx) {
        //we are expecting format: name; or name num; or name/num
        //first split using semi colon
        var resa = str.split(/,|;/g)
        , val
        , patt = /([A-z\s]+)\s([0-9\.]+)/
        , pres
        ;
        //loop through the values
        for (let i in resa) {
            val = resa[i].trim();
            //see if this is name/num
            if (val.indexOf('/') > -1) {
                val = val.split('/');
            }
            else if (val.indexOf(':') > -1){
                val = val.split(':');
            }
            else {
                pres = patt.exec(val);
                if (patt.test(val)) {
                    val = patt.exec(val);
                    val.shift();
                }
                else {
                    val = [val];
                }
            }
            //remove like
            if (val[0].indexOf('like') > -1) {
                val[0] = val[0].replace('like', '').trim();
                val[1] = 'like';
            }
            //add to the tokens
            tokens[val[0].toLowerCase()] = val[1];
            //if this is the 2nd match then this is system
            if (indx == 1) {
                agent.system[val[0]] = val[1];
            }
            //if this is the 4th match then it's platform
            else if (indx == 3) {
                agent.platform[val[0]] = val[1];
            }
            else {
                agent.other[val[0]] = val[1];
            }
        }
    }
    /**
   * @function
   */
    function detectBrowser() {
        var ver;
        //loop through the rules
        for (let key in userAgentRules) {
            if (
                ver = checkToken(
                    userAgentRules[key].contain
                )
            ) {
                if (
                    !checkToken(
                        userAgentRules[key].notcontain
                    )
                ) {
                    agent.browser.name = key;
                    ver = getVersion(
                        ver
                    );
                    agent.browser.version = parseVersion(
                        ver
                    );
                }
            }
        }
   }
    /**
   * @function
   */
    function checkToken(arr) {
        for (let i = 0, l = arr.length; i < l; i++) {
            if (tokens.hasOwnProperty(arr[i])) {
                return tokens[arr[i]];
            }
        }
        return false;
   }
    /**
   * @function
   */
    function getVersion(ver) {
        var rules = ['rv', 'version', 'msie']
        ;
        if (is_nill(ver)) {
            for (let i in rules) {
                if (tokens.hasOwnProperty(rules[i])) {
                    return tokens[rules[i]];
                }
            }
        }
        return ver;
   }
    /**
   * @function
   */
    function parseVersion(ver) {
        var vera = ver.split(/\.|\+/)
        , verObj = {}
        , map=['major', 'minor', 'patch', 'build']
        ;
        for (let i = 0; i < 4; i++) {
            verObj[map[i]] = vera[i]
        }
       return verObj;
   }
}