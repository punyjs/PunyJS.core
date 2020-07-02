/**
* @factory
*/
function _EventEmitter(
    promise
    , is_object
    , is_func
    , is_nill
) {
    /**
    * @property
    * @private
    */
    var listeners = {}
    /**
    * @property
    * @private
    */
    , errors = []
    /**
    * @constants
    */
    , cnsts = {
        "maxErrorLength": 100
    }
    ;

    /**
    * @worker
    * @prototype
    */
    return Object.create(null, {
        "on": {
            "enumerable": true
            , "value": function on(eventName, callback, options) {
                addListener(
                    eventName
                    , callback
                    , options
                );
            }
        }
        , "once": {
            "enumerable": true
            , "value": function once(eventName, callback, options) {
                if (!is_object(options)) {
                    options = {};
                }
                options.once = true;
                addListener(
                    eventName
                    , callback
                    , options
                );
            }
        }
        , "off": {
            "enumerable": true
            , "value": function off(eventName, callback) {
                removeListener(
                    eventName
                    , callback
                );
            }
        }
        , "emit": {
            "enumerable": true
            , "value": function emit(eventName, details) {
                fireEvent(
                    eventName
                    , details
                );
            }
        }
    });

    /**
    * @function
    */
    function addListener(eventName, callback, options) {
        if (!listeners.hasOwnProperty(eventName)) {
            listeners[eventName] = [];
        }
        listeners[eventName].push(
            {
                "callback": callback
                , "options": options
            }
        );
    }
    /**
    * @function
    */
    function removeListener(eventName, callback) {
        if (!eventName) {
            listeners = {};
            return true;
        }
        if (!listeners.hasOwnProperty(eventName)) {
            return false;
        }
        //if there is a callback then we are removing just the one listener
        if (is_func(callback)) {
            var index =  getListenerIndex(
                eventName
                , callback
            );
            if (index !== -1) {
                delete listeners[eventName][index];
            }
            //if the listeners collection is empty we can destroy the container
            if (listeners[eventName].length === 0) {
                delete listeners[eventName];
            }
        }
        //otherwise lets remove all of them
        else {
            delete listeners[eventName];
        }

        return true;
    }
    /**
    * @function
    */
    function getListenerIndex(eventName, callback) {
        return listeners[eventName]
        .findIndex(function findCbIndex(listener) {
            return listener.callback === callback;
        });
    }
    /**
    * @function
    */
    function fireEvent(eventName, details) {
        var eventListeners = listeners[eventName]
        , runOnceIndexes = []
        ;
        if (is_nill(eventListeners) || eventListeners.length === 0) {
            return false;
        }
        //loop through the listeners
        eventListeners.forEach(
            executeCallback.bind(null, runOnceIndexes, details)
        );
        //remove any run once entries
        runOnceIndexes.forEach(
            function forEachRunOnceIndex(runOnceIndex) {
                eventListeners.splice(runOnceIndex, 1);
            }
        );

        return true;
    }
    /**
    * @function
    */
    function executeCallback(runOnceIndexes, details, listener, index) {
        if (details.runAsync === true) {
            executeCallbackAsyncronous(
                listener
                , details
            );
        }
        else {
            executeCallbackSyncronous(
                listener
                , details
            );
        }
        //remove the listener for run once
        if (listener.options.once === true) {
            runOnceIndexes.push(index);
        }
    }
    /**
    * @function
    */
    function executeCallbackSyncronous(listener, details) {
        try {
            execute(
                listener
                , details
            )
        }
        catch(ex) {
            addError(ex);
        }
    }
    /**
    * @function
    */
    function executeCallbackAsyncronous(listener, details) {
        promise
        .resolve()
        .then(function thenExecuteListener() {
            try {
                execute(
                    listener
                    , details
                )
            }
            catch(ex) {
                addError(ex);
            }
        });
    }
    /**
    * @function
    */
    function execute(listener, details) {
        if (is_object(details)) {
            listener.callback(
                Object.create(details) //create a new object for each event
            );
        }
        else {
            listener.callback();
        }
    }
    /**
    * @function
    */
    function addError(ex) {
        errors.push(ex);
        //drop the first member if we've surpassed the max error length
        if (errors.length > cnsts.maxErrorLength) {
            errors.shift();
        }
    }
}