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
                , "value": fireEvent.bind(null, listeners)
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
    function fireEvent(listeners, eventName, details) {
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
        var options = listener.options
        , runAsync = details.runAsync === true
            ? true
            : !!options
                && listener.options.runAsync
                || false
        ;
        if (runAsync) {
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
        if (!!options && options.once === true) {
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
            listener.callback(details);
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