/**
* @factory
*/
function _EventEmitter(
    promise
    , is_object
    , is_func
    , is_nill
    , is_array
) {

    /**
    * @constants
    */
    var cnsts = {
        "maxErrorLength": 100
    }
    ;

    return EventEmitter;

    /**
    * @worker
    */
    function EventEmitter(listeners = {}, errors = []) {
        if (!is_object(listeners)) {
            listeners = {};
        }
        if (!is_array(errors)) {
            errors = [];
        }
        /**
        * @prototype
        */
        return Object.create(null, {
            "on": {
                "enumerable": true
                , "value": addListener.bind(null, listeners)
            }
            , "once": {
                "enumerable": true
                , "value": once.bind(null, listeners)
            }
            , "off": {
                "enumerable": true
                , "value": removeListener.bind(null, listeners)
            }
            , "emit": {
                "enumerable": true
                , "value": fireEvent.bind(null, listeners, errors)
            }
            , "errors": {
                "enumerable": true
                , "value": errors
            }
        });
    }
    /**
    * @function
    */
    function once(listeners, eventName, callback, options) {
        if (!is_object(options)) {
            options = {};
        }
        options.once = true;
        addListener(
            listeners
            , eventName
            , callback
            , options
        );
    }
    /**
    * @function
    */
    function addListener(listeners, eventName, callback, options) {
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
    function removeListener(listeners, eventName, callback) {
        if (!eventName) {
            ///TODO: clear the listeners rather than using a new object, we need to keep the reference
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
    function fireEvent(listeners, errors, eventName, details) {
        try {
            var eventListeners = listeners[eventName]
            , runOnceIndexes = []
            ;
            if (is_nill(eventListeners) || eventListeners.length === 0) {
                return false;
            }
            //loop through the listeners
            eventListeners.forEach(
                executeCallback.bind(null, runOnceIndexes, details, errors)
            );
            //remove any run once entries
            runOnceIndexes.forEach(
                function forEachRunOnceIndex(runOnceIndex) {
                    eventListeners.splice(runOnceIndex, 1);
                }
            );

            return true;
        }
        catch(ex) {
            addError(errors, ex);
            return false;
        }
    }
    /**
    * @function
    */
    function executeCallback(runOnceIndexes, details, errors, listener, index) {
        var options = listener.options
        , runAsync = details.runAsync === true
            ? true
            : !!options
                && options.runAsync
                || false
        , passed
        ;

        if (runAsync) {
            executeCallbackAsyncronous(
                listener
                , details
                , errors
            );
        }
        else {
            passed = executeCallbackSyncronous(
                listener
                , details
                , errors
            );
        }
        //remove the listener for run once
        if (!!options && options.once === true) {
            runOnceIndexes.push(index);
        }

        return passed;
    }
    /**
    * @function
    */
    function executeCallbackSyncronous(listener, details, errors) {
        try {
            execute(
                listener
                , details
            );

            return true;
        }
        catch(ex) {
            addError(errors, ex);
            return false;
        }
    }
    /**
    * @function
    */
    function executeCallbackAsyncronous(listener, details, errors) {
        promise
        .resolve()
        .then(function thenExecuteListener() {
            try {
                execute(
                    listener
                    , details
                );
            }
            catch(ex) {
                addError(errors, ex);
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
            listener.callback(details);
        }
    }
    /**
    * @function
    */
    function addError(errors, ex) {
        errors.push(ex);
        //drop the first member if we've surpassed the max error length
        if (errors.length > cnsts.maxErrorLength) {
            errors.shift();
        }
    }
}