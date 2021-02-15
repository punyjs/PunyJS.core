/**
* Create watcher builds a proxy with the included options, target, and event properties.
*/
function _CreateWatcher(
    proxy
    , weakMap
    , is_object
    , is_objectValue
    , is_func
    , is_symbol
    , is_array
    , is_numeric
    , is_string
    , utils_apply
    , utils_copy
    , utils_deep
    , reporter
    , errors
    , defaults
    , infos
) {
    /**
    * A map of additional trap handlers that could be added
    * @property
    */
    var trapFunctions = {
        "apply": applyTrap
        , "construct": constructTrap
    }
    ;

    //add the type check
    CreateWatcher.isWatched = isWatched;

    return CreateWatcher;

    /**
    * @worker
    */
    function CreateWatcher(target, events, options) {
        options = utils_apply(
            options
            , utils_copy(defaults.core.proxy.watcher)
        );

        //create weak maps for the specific watcher
        options.proxyMap = new weakMap();
        options.arrayChangeMap = new weakMap();
        options.arrayOpMap = new weakMap();

        return createProxy(
            target
            , options
            , events
        );
    }

    /**
    * @function
    */
    function createProxy(target, options, events, parentName) {
        return new proxy(
            target
            , getProxyTraps(
                options
                , events
                , parentName
            )
        );
    }
    /**
    * @function
    */
    function getProxyTraps(options, events, parentName) {
        //default traps, some are required to satisfy completeness
        var traps = {
            "get": getTrap.bind(
                null
                , options
                , events
                , parentName
            )
            , "set": setTrap.bind(
                null
                , options
                , events
                , parentName
            )
            , "deleteProperty": deletePropertyTrap.bind(
                null
                , options
                , events
                , parentName
            )
        };

        options.traps
        .forEach(function forEachTrap(trapName) {
            if (trapName === "delete") {
                trapName = "deleteProperty";
            }
            if (traps.hasOwnProperty(trapName)) {
                return;
            }
            var trapFn = trapFunctions[trapName];
            if (!trapFn) {
                throw new Error(
                    `${errors.core.proxy.invalid_trap_name} (${trapName})`
                );
            }
            traps[trapName] = trapFn.bind(
                null
                , options
                , events
                , parentName
            );
        });

        return traps;
    }
    /**
    * @function
    */
    function getTrap(
        options
        , events
        , parentName
        , target
        , propName
        , receiver
    ) {
        //if this is the watched identifier
        if (propName === "$$isWatched$$") {
            return true;
        }
        //if this is an event property then return it
        if (events.hasOwnProperty(propName)) {
            //if the property is a function, we need to add the parent namespace
            if (is_func(events[propName])) {
                //inject a func to append the namespaces
                return function eventWrap(...args) {
                    if (!!parentName && !!args[0]) {
                        args[0] = appendParentNamespace(
                            parentName
                            , args[0]
                        );
                    }
                    events[propName].apply(null, args);
                };
            }
            //otherwise return the value
            return events[propName];
        }
        //get the value
        var value = target[propName]
        , fullKey = getFullKey(parentName, propName)
        , valueProxy
        ;
        //if the target is an array and the prop is a prototype function
        if (
            is_array(target)
            && Object.getPrototypeOf(target) === Array.prototype
            && ["push","splice"].indexOf(propName) !== -1
        ) {
            //store the function name for subsequent processing
            options.arrayOpMap.set(target, propName);
        }
        //if the value is an object or function
        if (is_objectValue(value) || is_func(value)) {
            //if the value is already a proxy then return it
            if (value.$$isWatched$$ === true) {
                return value;
            }
            //otherwise create a proxy but only for owned properties, to leave the prototype stuff alone
            if (target.hasOwnProperty(propName)) {
                valueProxy = options.proxyMap.get(value);
                if (!valueProxy) {
                    valueProxy = createProxy(
                        value
                        , options
                        , events
                        , fullKey
                    );
                    options.proxyMap.set(
                        value
                        , valueProxy
                    );
                }
                return valueProxy;
            }
        }
        //all others
        return value;
    }
    /**
    * Handles property assignment, but throws an error if the property is an event function
    * @function
    */
    function setTrap(
        options
        , events
        , parentName
        , target
        , propName
        , value
        , receiver
    ) {
        //we can't set the event functions, throw an error
        if (events.hasOwnProperty(propName)) {
            throw new Error(
                `${errors.core.proxy.unable_to_set_event_property} (${propName})`
            );
        }

        //see if we are including event details
        var includeDetails = options.includeDetails.indexOf("set") !== -1
        //see if the property exists
        , hasProp = includeDetails && propName in target
        //  capture the old value if we do
        , oldValue = hasProp && target[propName] || undefined
        //details start out as just the full key
        , fullKey = getFullKey(
            parentName
            , propName
        )
        , details
        ;
        ///LOGGING
        reporter.extended(
            `${infos.proxy.set_trap_called} (${fullKey}, emitterId:${events.emitterId})`
        );
        ///END LOGGING
        //remove any proxies from the map
        if (is_objectValue(oldValue) || is_func(oldValue)) {
            if (options.proxyMap.has(oldValue)) {
                options.proxyMap.delete(oldValue);
            }
        }
        //handle arrays seperately
        if (is_array(target) && options.traps.indexOf("set") !== -1) {
            return handleSetArray(
                options
                , events
                , parentName
                , target
                , propName
                , value
                , oldValue
                , hasProp
            );
        }

        //set the value
        target[propName] = value;

        //if this is part of the traps list
        if (options.traps.indexOf("set") !== -1) {
            //see if we are including details
            if (includeDetails) {
                details = {
                    "action": "set"
                    , "key": fullKey
                    , "value": value
                    , "oldValue": oldValue
                    , "miss": !hasProp
                };
            }
            //fire any events
            fireListeners(
                events
                , "set"
                , fullKey
                , details || fullKey
            );
        }

        return true;
    }
    /**
    * Handles property deletion, but throws an error if the property is an event property
    * @function
    */
    function deletePropertyTrap(
        options
        , events
        , parentName
        , target
        , propName
    ) {
        if (events.hasOwnProperty(propName)) {
            throw new Error(
                `${errors.core.proxy.unable_to_delete_event_property} (${propName})`
            );
        }
        //handle arrays seperately
        if (
            is_array(target)
            && options.traps.indexOf("delete") !== -1
        ) {
            return handleDeleteArray(
                options
                , events
                , parentName
                , target
                , propName
            );
        }
        //see if we are including event details
        var includeDetails = options.includeDetails.indexOf("delete") !== -1
        //  and if we are get the value before it's deleted
        , value = target[propName]
        //delete the property
        , deleted = delete target[propName]
        , fullKey = getFullKey(parentName, propName)
        , details
        ;
        ///LOGGING
        reporter.extended(
            `${infos.proxy.delete_trap_called} (${fullKey}, emitterId:${events.emitterId})`
        );
        ///END LOGGING
        //remove any proxies from the map
        if (is_objectValue(value) || is_func(value)) {
            if (options.proxyMap.has(value)) {
                options.proxyMap.delete(value);
            }
        }
        //if this is part of the traps list
        if (options.traps.indexOf("delete") !== -1) {
            //see if we are including details
            if (includeDetails) {
                details = {
                    "action": "delete"
                    , "key": fullKey
                    , "oldValue": value
                    , "miss": !deleted
                };
            }
            fireListeners(
                events
                , "delete"
                , fullKey
                , details || fullKey
            );
        }

        return deleted;
    }

    /**
    * @function
    */
    function applyTrap(options, events, parentName, target, thisArg, args) {
        //if target.apply is called, this will be executed twice, once for the .apply and then for the apply on the actual function
        if (parentName.endsWith(".apply")) {
            return target.apply(
                thisArg
                , args
            );
        }
        //see if we are including event details
        var includeDetails = options.includeDetails.indexOf("apply") !== -1
        , fullKey = parentName
        , details
        ;
        ///LOGGING
        reporter.extended(
            `${infos.proxy.apply_trap_called} (${fullKey}, emitterId:${events.emitterId})`
        );
        ///END LOGGING
        //if this is part of the traps list
        if (options.traps.indexOf("apply") !== -1) {
            //see if we are including details
            if (includeDetails) {
                details = {
                    "action": "apply"
                    , "key": fullKey
                    , "scope": thisArg
                    , "args": args
                };
            }
            //fire any events
            fireListeners(
                events
                , "apply"
                , fullKey
                , details || fullKey
            );
        }

        return target.apply(
            thisArg
            , args
        );
    }
    /**
    * @function
    */
    function constructTrap(options, events, parentName, target, args) {
        //see if we are including event details
        var includeDetails = options.includeDetails.indexOf("construct") !== -1
        , fullKey = parentName
        , details
        ;
        ///LOGGING
        reporter.extended(
            `${infos.proxy.construct_trap_called} (${fullKey}, emitterId:${events.emitterId})`
        );
        ///END LOGGING
        //if this is part of the traps list
        if (options.traps.indexOf("construct") !== -1) {
            //see if we are including details
            if (includeDetails) {
                details = {
                    "action": "construct"
                    , "key": fullKey
                    , "args": args
                };
            }
            //fire any events
            fireListeners(
                events
                , "construct"
                , fullKey
                , details || fullKey
            );
        }

        return new target(
            args
        );
    }

    /**
    * Appends the parent name to the prop name if exists
    * @function
    */
    function getFullKey(parentName, propName) {
        //what to do with symbols
        if (is_symbol(propName)) {
            propName = propName.toString();
        }
        return !!parentName
            ? `${parentName}.${propName}`
            : propName
        ;
    }
    /**
    * @function
    */
    function fireListeners(events, action, key, details) {
        var prefix = ""
        , curKey
        ;
        if (action !== "set") {
            prefix = `${action} `;
        }
        //fire the key event
        events.emit(
            `${prefix}${key}`
            , details
        );
        //fire any listen alls
        events.emit(
            `${prefix}*`
            , details
        );
        //fire any wildcard events
        key.split(".")
        .forEach(
            function forEachSegment(segment) {
                if (!curKey) {
                    curKey = segment;
                }
                else {
                    curKey = `${curKey}.${segment}`
                }
                events.emit(
                    `${prefix}${curKey}.*`
                    , details
                );
            }
        );
    }
    /**
    * @function
    */
    function appendParentNamespace(parentName, namespaces) {
        if (!is_array(namespaces)) {
            namespaces = [namespaces];
        }
        for(let i = 0, l = namespaces.length; i < l;i ++) {
            var parts = namespaces[i].split(" ")
            , action = parts.length === 2
                ? `${parts[0]} `
                : ""
            , name = parts.length === 2
                ? parts[1]
                : namespaces[i]
            , namespace = !!parentName
                ? `${parentName}.${name}`
                : name
            ;
            namespaces[i] = `${action}${namespace}`;
        }
        return namespaces;
    }

    /**
    * @function
    */
    function handleSetArray(
        options
        , events
        , parentName
        , target
        , propName
        , value
        , oldValue
        , hasProp
    ) {
        var changeList = options.arrayChangeMap.get(target)
        , op = options.arrayOpMap.get(target)
        ;
        //if this is not a length change then it is part of a change cycle
        if (propName !== 'length') {
            //set the value
            target[propName] = value;
            //if there isn't a change list, this is the start of a cycle
            if (!changeList) {
                options.arrayChangeMap.set(target, (changeList = []));
            }
            //add a change record to the list
            changeList.push(
                {
                    "action": "set"
                    , "key": getFullKey(
                        parentName
                        , propName
                    )
                    , "value": value
                    , "oldValue": oldValue
                    , "miss": !hasProp
                }
            );
            //if there isn't an operation then process the update immediately
            if (!op) {
                options.arrayChangeMap.delete(target);
                processArrayChangeCycle(
                    options
                    , events
                    , parentName
                    , target
                    , changeList
                );
            }
        }
        //if there isn't a change list then this is just an array length update
        else if (!changeList) {
            handleLengthChange(
                options
                , events
                , parentName
                , target
                , propName
                , value
                , oldValue
            );
            //set the value
            target[propName] = value;
        }
        //otherwise this is the end of a change cycle
        else {
            //remove the array change map for this target
            options.arrayChangeMap.delete(target);
            options.arrayOpMap.delete(target);
            processArrayChangeCycle(
                options
                , events
                , parentName
                , target
                , changeList
            );
            //set the value
            target[propName] = value;
        }

        return true;
    }
    /**
    * @function
    */
    function handleLengthChange(
        options
        , events
        , parentName
        , target
        , propName
        , newLength
        , oldLength
    ) {
        var includeDetails = options.includeDetails.indexOf("set") !== -1
        , details
        , fullKey
        , index
        ;
        //if this is reducing, fire delete events
        if (oldLength > newLength) {
            while(oldLength > newLength) {
                oldLength--;
                fullKey = getFullKey(
                    parentName
                    , oldLength
                );
                //see if we are including details
                if (includeDetails) {
                    details = {
                        "action": "delete"
                        , "key": fullKey
                        , "oldValue": target[oldLength]
                        , "arrayAction": "delete"
                        , "miss": !target[oldLength]
                    };
                }
                //fire any events
                fireListeners(
                    events
                    , "delete"
                    , fullKey
                    , details || fullKey
                );
            }
        }
    }
    /**
    * @function
    */
    function handleDeleteArray(
        options
        , events
        , parentName
        , target
        , propName
    ) {
        var changeList = options.arrayChangeMap.get(target)
        , fullkey = getFullKey(
            parentName
            , propName
        )
        , oldValue
        ;
        //if there isn't a change list then this is a replace of a current member with null
        if (!changeList) {
            oldValue = target[propName];
            target[propName] = null;
            processArrayChangeCycle(
                options
                , events
                , parentName
                , target
                , [
                    {
                        "action": "set"
                        , "key": fullkey
                        , "oldValue": oldValue
                        , "value": null
                        , "miss": false
                    }
                ]
            );
        }
        else {
            delete target[propName];
            //add a change record to the list and wait for length change
            changeList.push(
                {
                    "action": "delete"
                    , "key": fullkey
                    , "oldValue": target[propName]
                    , "miss": false
                }
            );
        }

        return true;
    }
    /**
    * @function
    */
    function processArrayChangeCycle(
        options
        , events
        , parentName
        , target
        , changeList
    ) {
        //see if we are including event details
        var includeDetails = options.includeDetails.indexOf("set") !== -1
        , details
        , firstEntry = changeList[0]
        , lastEntry = changeList[changeList.length - 1]
        , secondLastEntry = changeList[changeList.length - 2]
        , oldValue
        , value
        , fullKey
        , action
        , miss
        , arrayAction
        ;

        //if the last member is a delete, then this is a delete operation
        if (lastEntry.action === "delete") {
            //the first change has the deleted value and key
            fullKey = firstEntry.key;
            oldValue = firstEntry.oldValue;
            action = arrayAction = "delete";
            miss = false;
        }
        //if there is only one entry then this is an append or replace
        else if (changeList.length === 1) {
            fullKey = firstEntry.key;
            value = firstEntry.value;
            action = "set";
            if (firstEntry.miss) {
                arrayAction = "append";
                miss = true;
            }
            else {
                arrayAction = "replace";
                miss = false;
                oldValue = firstEntry.oldValue;
            }
        }
        //otherwise this is an insert operation
        else {
            //the final change should be the insert
            fullKey = lastEntry.key;
            value = lastEntry.value;
            oldValue = secondLastEntry.value;
            action = "set";
            arrayAction = "insert";
            miss = false;
        }

        //see if we are including details
        if (includeDetails) {
            details = {
                "action": action
                , "key": fullKey
                , "value": value
                , "oldValue": oldValue
                , "arrayAction": arrayAction
                , "miss": miss
            };
        }
        //fire any events
        fireListeners(
            events
            , action
            , fullKey
            , details || fullKey
        );
    }

    /**
    * @function
    */
    function isWatched(value) {
        if (is_objectValue(value) || is_func(value)) {
            return value.$$isWatched$$ === true;
        }
        return false;
    }
}