/**
* @factory
*/
function _EventEmitter(
    promise
    , is_object
    , is_func
    , is_nill
    , is_array
    , utils_copy
    , utils_clear
) {

    return EventEmitter;

    /**
    * @worker
    */
    function EventEmitter(listeners = {}, prototype = Object.prototype) {
        if (!is_object(listeners)) {
            listeners = {};
        }
        /**
        * @prototype
        */
        return Object.create(
            prototype
            , {
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
                , "hasEventListener": {
                    "enumerable": true
                    , "value": hasEventListener.bind(null, listeners)
                }
                , "emit": {
                    "enumerable": true
                    , "value": fireEvent.bind(null, listeners)
                }
            }
        );
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
        if (is_array(eventName)) {
            for(let i = 0, l = eventName.length; i < l; i++) {
                addListener(
                    listeners
                    , eventName[i]
                    , callback
                    , options
                );
            }
            return;
        }
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
        //clear all of the listeners if there is no event name
        if (!eventName) {
            utils_clear(listeners);
            return true;
        }
        //if the event name doesn't exist, nothing to do
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
        //otherwise lets remove all of them for this event name
        else {
            delete listeners[eventName];
        }

        return true;
    }
    /**
    * @function
    */
    function hasEventListener(listeners, eventName) {
        if (!listeners.hasOwnProperty(eventName)) {
            return false;
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
                && options.runAsync
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
        execute(
            listener
            , details
        );
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
                );
            }
            catch(ex) {
                return promise.reject(ex);
            }
        });
    }
    /**
    * @function
    */
    function execute(listener, details) {
        if (is_object(details)) {
            listener.callback(details);
        }
        else {
            listener.callback(details);
        }
    }
}