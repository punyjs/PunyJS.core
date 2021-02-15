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
    , utils_uuid
    , reporter
    , infos
) {

    return EventEmitter;

    /**
    * @worker
    */
    function EventEmitter(listeners = {}, prototype = Object.prototype) {
        if (!is_object(listeners)) {
            listeners = {};
        }
        var emitterId = utils_uuid(
            {"version":4}
        );
        /**
        * @prototype
        */
        return Object.create(
            prototype
            , {
                "emitterId": {
                    "enumerable": false
                    , "value": emitterId
                }
                , "listeners": {
                    "enumerable": false
                    , "value": listeners
                }
                , "on": {
                    "enumerable": true
                    , "value": addListeners.bind(null, emitterId, listeners)
                }
                , "once": {
                    "enumerable": true
                    , "value": once.bind(null, emitterId, listeners)
                }
                , "off": {
                    "enumerable": true
                    , "value": removeListener.bind(null, emitterId, listeners)
                }
                , "hasEventListener": {
                    "enumerable": true
                    , "value": hasEventListener.bind(null, emitterId, listeners)
                }
                , "emit": {
                    "enumerable": true
                    , "value": fireEvent.bind(null, emitterId, listeners)
                }
            }
        );
    }
    /**
    * @function
    */
    function once(emitterId, listeners, eventName, callback, options) {
        if (!is_object(options)) {
            options = {};
        }
        options.once = true;
        addListener(
            emitterId
            , listeners
            , eventName
            , callback
            , options
        );
    }
    /**
    * @function
    */
    function addListeners(emitterId, listeners, eventNames, callback, options) {
        //if this is a single event name then process it
        if (!is_array(eventNames)) {
            addListener(
                emitterId
                , listeners
                , eventNames
                , callback
                , options
            );
        }
        //otherwise, process each in the array
        else {
            for(let i = 0, l = eventNames.length; i < l; i++) {
                addListener(
                    emitterId
                    , listeners
                    , eventNames[i]
                    , callback
                    , options
                );
            }
        }
    }
    /**
    * @function
    */
    function addListener(emitterId, listeners, eventName, callback, options) {
        if (!listeners.hasOwnProperty(eventName)) {
            listeners[eventName] = [];
        }
        options = options || {};
        listeners[eventName].push(
            {
                "callback": callback
                , "options": options
            }
        );
        reporter.event(
            `${infos.event.listener_added} (${eventName}:${emitterId}, once:${!!options.once})`
        );
        reporter.extended(
            `add listener - ${eventName}:${emitterId},[${Object.keys(listeners)}]`
        );
    }
    /**
    * @function
    */
    function removeListener(emitterId, listeners, eventName, callback) {
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
                listeners
                , eventName
                , callback
            );
            //see if the listener was found
            if (index !== -1) {
                delete listeners[eventName][index];
            }
            else {
                return false;
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

        reporter.event(
            `${infos.event.listener_removed} (${eventName}:${emitterId}, callback:${!!callback})`
        );

        return true;
    }
    /**
    * @function
    */
    function hasEventListener(emitterId, listeners, eventName) {
        if (!listeners.hasOwnProperty(eventName)) {
            return false;
        }
        return true;
    }
    /**
    * @function
    */
    function getListenerIndex(listeners, eventName, callback) {
        return listeners[eventName]
        .findIndex(function findCbIndex(listener) {
            return listener.callback === callback;
        });
    }
    /**
    * @function
    */
    function fireEvent(emitterId, listeners, eventName, details) {
        var eventListeners = listeners[eventName]
        , runOnceIndexes = []
        ;
        reporter.extended(
            `fire event - ${eventName}:${emitterId},[${!!listeners && Object.keys(listeners)}]`
        );
        if (is_nill(eventListeners) || eventListeners.length === 0) {
            return false;
        }
        //loop through the listeners
        eventListeners.forEach(
            executeCallback.bind(
                null
                , emitterId
                , eventName
                , runOnceIndexes
                , details
            )
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
    function executeCallback(emitterId, eventName, runOnceIndexes, details, listener, index) {
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

        reporter.event(
            `${infos.event.event_emitted} (${eventName}:${emitterId},async:${runAsync})`
        );
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