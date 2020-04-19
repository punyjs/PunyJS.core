/**
* A utility used to report the internal happenings of a unit, milestones, errors, information, etc ..., to external listeners.
*   > Control what gets reported using the `categories`;
*   > At runtime, the reporter only reports the messages at the categories specified, which allows for dynamic reporting.
*   > The listener execution happens asyncronousy, so it's non-blocking.
*   > Each listener function is called within it's own asyncronous
* @factory
*   @dependency {function} timestamper [":TruJS.timing._Timestamper",[]]
*   @dependency {funciton} is.object [":TruJS.is.Object",[]]
*   @dependency {funciton} is.array [":TruJS.is.Array",[]]
* ---
* @interface iReporterMessage
*   @property {string} message The reported message
*   @property {string} category The reported message's category
*   @property {object} [details] An optional collection of additional details about the message.
* --
* @interface iReporterListener
*   @property {function} fn The function to be called
*   @property {array} [categories] An array of categories that the function will be called for; defaults to all.
*/
function _Reporter(
    timestamper
    , is_object
    , is_array
) {
    /**
    * Represents the returned worker object object for reference instead of `this`
    * @property
    * @private
    */
    var self
    /**
    * A collection of error messages
    * @property
    * @private
    */
    , errors = {
        "invalid_reporter_listener": "[Invalid Reporter Listener] The reporter listener must be a function."
    }
    /**
    * A collection of constants
    * @property
    * @private
    */
    , cnsts = {
        "internalExceptionPrefix": "reporter error: "
    }
    /**
    * An array of {iReporterListener} objects
    * @property
    * @private
    */
    , listeners = []
    /**
    * The categories that will cause the listeners to fire
    * @property
    * @private
    */
    , categories = ["info","error","stack"]
    /**
    * A regular expression pattern for matchin string replacement charaters
    * @property
    */
    , STR_PATT = /%s/g
    ;

    /**
    * @worker
    */
    return self = Object.create(null, {
        /**
        * Adds 1 or more functions that will be called when a message is reported. Note: only messages that match the categories will cause a listener to be called
        * @method
        *   @param {function|array} listeners A function or array of functions that will be called
        *   @param {string|array} [categories] A category, or array of categories, that the handler(s) will be called for; default `undefined` denotes all categories.
        */
        "addListener": {
            "enumerable": true
            , "value": function addListener(listenerFns, categories) {
                if (!Array.isArray(listenerFns)) {
                    listenerFns = [listenerFns];
                }
                if(!!categories && !Array.isArray(categories)) {
                    categories = [categories];
                }
                listenerFns.forEach(function(listenerFn) {
                    listeners.push(
                        createListener(listenerFn, categories)
                    );
                });
                //return self for chaining
                return self;
            }
        }
        /**
        * Set the catgories that will be reported
        * @method
        *   @param {string|array} category A category, or array of categories, that will be reported; default is info, error, and stack. A special value, "all", will cause all categories to be reported.
        */
        , "setCategories": {
            "enumerable": true
            , "value": function setLevel(category) {
                if(!Array.isArray(category)) {
                    categories = [category];
                }
                else {
                    categories = category;
                }
                //return self for chaining
                return self;
            }
        }
        /**
        * The generic report method, takes both a category and a message
        * @method
        *   @param {string} category A string that catgorizes the reported message.
        *   @param {string} message A message that is being reported
        *   @param {object} [details] An object containing details about the message; group, indent, `{your need here}`. The detail object is copied to keep from hold references to objects that should be released.
        *   @param {string} [timestamp] A number representing the number of ms elapsed since `origin`
        */
        , "report": {
            "enumerable": true
            , "value": function report(category, message, details, timestamp) {
                //generate a timestamp if not provided
                timestamp = timestamp || timestamper();
                //test to see if we are reporting this category
                if (categories.indexOf(category) === -1
                    && categories.indexOf("all") === -1) {
                    return;
                }
                //fire the listeners
                fireListeners(
                    timestamp
                    , category
                    , message
                    , details
                );
            }
        }
        /**
        * A method to report messages with a `log` category
        * @method
        *   @extends report
        *   @argument {string} category "log"
        */
        , "log": {
            "enumerable": true
            , "value": function info(message, details, timestamp) {
                //generate a timestamp if not provided
                timestamp = timestamp || timestamper();
                self.report(
                    "log"
                    , message
                    , details
                    , timestamp
                );
            }
        }
        /**
        * A method to report messages with a `info` category
        * @method
        *   @extends report
        *   @argument {string} category "info"
        */
        , "info": {
            "enumerable": true
            , "value": function info(message, details, timestamp) {
                //generate a timestamp if not provided
                timestamp = timestamp || timestamper();
                self.report(
                    "info"
                    , message
                    , details
                    , timestamp
                );
            }
        }
        /**
        * A method to report messages with a `extended` category
        * @method
        *   @extends report
        *   @argument {string} category "extended"
        */
        , "extended": {
            "enumerable": true
            , "value": function extended(message, details, timestamp) {
                //generate a timestamp if not provided
                timestamp = timestamp || timestamper();
                self.report(
                    "extended"
                    , message
                    , details
                    , timestamp
                );
            }
        }
        /**
        * A method to report messages with a `metric` category
        * @method
        *   @extends report
        *   @argument {string} category "metric"
        */
        , "metric": {
            "enumerable": true
            , "value": function metric(message, details, timestamp) {
                //generate a timestamp if not provided
                timestamp = timestamp || timestamper();
                self.report(
                    "metric"
                    , message
                    , details
                    , timestamp
                );
            }
        }
        /**
        * A method to report messages with a `warning` category
        * @method
        *   @extends report
        *   @argument {string} category "warning"
        */
        , "warning": {
            "enumerable": true
            , "value": function warning(message, details, timestamp) {
                //generate a timestamp if not provided
                timestamp = timestamp || timestamper();
                self.report(
                    "warning"
                    , message
                    , details
                    , timestamptimestamp
                );
            }
        }
        /**
        * A method to report messages with a `error` category. If the err is an actual Error then both the message and stack will be reported.
        * @method
        *   @extends report
        *   @argument {string} category "error"
        */
        , "error": {
            "enumerable": true
            , "value": function error(err, details, timestamp) {
                //generate a timestamp if not provided
                timestamp = timestamp || timestamper();
                if (!!err.message) {
                    self.report(
                        "error"
                        , err.message
                        , details
                        , timestamp
                    );
                    self.report(
                        "stack"
                        , err.stack
                        , details
                        , timestamp
                    );
                }
                else {
                    self.report(
                        "error"
                        , err
                        , details
                        , timestamp
                    );
                }
            }
        }
        /**
        * A method to report messages with an `event` category
        * @method
        *   @extends report
        *   @argument {string} category "event"
        */
        , "event": {
            "enumerable": true
            , "value": function error(message, details, timestamp) {
                //generate a timestamp if not provided
                timestamp = timestamp || timestamper();
                self.report(
                    "event"
                    , message
                    , details
                    , timestamp
                );
            }
        }
        /**
        * A method to report messages with an `ioc` category
        * @method
        *   @extends report
        *   @argument {string} category "ioc"
        */
        , "ioc": {
            "enumerable": true
            , "value": function error(message, details, timestamp) {
                //generate a timestamp if not provided
                timestamp = timestamp || timestamper();
                self.report(
                    "ioc"
                    , message
                    , details
                    , timestamp
                );
            }
        }
        /**
        * A method to report messages with `state` category
        * @method
        *   @extends report
        *   @argument {string} category "state"
        */
        , "state": {
            "enumerable": true
            , "value": function error(message, details, timestamp) {
                //generate a timestamp if not provided
                timestamp = timestamp || timestamper();
                self.report(
                    "state"
                    , message
                    , details
                    , timestamp
                );
            }
        }
    });

    /**
    * Fires the listeners asyncronously, non-blocking, non-successive
    * @function
    *   @param {string} category The category of the reported message
    *   @param {string} message The message that will be reported
    *   @param {object} [details] An object with details about the message
    *   @param {number} timestamp The # of millisencons since origin
    */
    function fireListeners(timestamp, category, message, details) {
        if (listeners.length > 0) {
            //ensure the message is a string
            if (typeof message !== "string") {
                try {
                    message = JSON.stringify(message);
                }
                catch(ex) { //message is useless at this point, re-purpose
                    message = cnsts.internalExceptionPrefix + ex;
                }
            }
            //if there are details, let's make sure we aren't going to keep a reference to variables that should be released
            if (!!details && typeof details === "object") {
                try {
                    details = JSON.parse(JSON.stringify(details));
                }
                catch(ex) {
                    details = cnsts.internalExceptionPrefix + ex;
                }
            }

            //create an array to hold the listener promises
            var procs = []
            , counter
            , reportMessage = {
                "category": category
                , "message": message
                , "timestamp": timestamp
            }
            , detailKeys;

            if (!!details) {
                reportMessage.details = details;

                if (is_object(details)) {
                    detailKeys = Object.keys(details);
                }
                //update the message with the details if %s exists
                if (STR_PATT.test(message)) {
                    counter = -1;
                    reportMessage.message =
                        message.replace(STR_PATT, function replaceStr() {
                            counter++;
                            if (is_array(detailKeys)) {
                                return details[detailKeys[counter]];
                            }
                            return details[counter];
                        });
                }
            }

            listeners.forEach(function forEachHandler(listener) {
                procs.push(
                    new Promise(function handlerPromise() {
                        try {

                            if (
                                !listener.categories
                                || listener.categories.indexOf(category) !== -1
                            ) {
                                listener.fn(reportMessage);
                            }
                        }
                        catch(ex) {
                            //swallow, do we care if an external reporting  handler function throws an error?
                        }
                    })
                );
            });

            Promise.all(procs);
        }
    }
    /**
    * Creates a listener object
    * @function
    */
    function createListener(fn, categories) {
        if (typeof fn !== "function") {
            throw new Error(
                `${errors.invalid_reporter_listener} (${typeof fn})`
            );
        }
        return {
            "fn": fn
            , "categories": categories
        };
    }
}