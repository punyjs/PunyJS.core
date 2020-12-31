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
    , utils_apply
    , utils_copy
    , utils_deep
    , errors
    , defaults
) {
    /**
    * A map of additional trap handlers that could be added
    * @property
    */
    var trapFunctions = {
        "apply": applyTrap
        , "construct": constructTrap
    }
    , arrayChangeMap = new weakMap()
    ;

    return CreateWatcher;

    /**
    * @worker
    */
    function CreateWatcher(target, events, options = false) {
        options = utils_apply(
            options
            , utils_copy(defaults.core.proxy.watcher)
        );
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
            , "has": hasTrap.bind(
                null
                , options
                , events
                , parentName
            )
            , "ownKeys": ownKeysTrap.bind(
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
        //if this is an event property then return it
        if (events.hasOwnProperty(propName)) {
            //append the namespaces
            return function eventWrap(...args) {
                args[0] = appendParentNamespace(
                    parentName
                    , args[0]
                );
                events[propName].apply(null, args);
            };
        }
        //see if we are including event details
        var includeDetails = options.includeDetails.indexOf("get") !== -1
        //see if we have a property to get, we don't care if it's on a prototype
        , hasProp = includeDetails && propName in target
        //get the value
        , value = target[propName]
        , details
        , fullKey = getFullKey(parentName, propName)
        ;
        //if this is part of the traps list
        if (options.traps.indexOf("get") !== -1) {
            //see if we are including details
            if (includeDetails) {
                details = {
                    "action": "get"
                    , "key": fullKey
                    , "value": value
                    , "miss": !hasProp
                };
            }
            //fire any events
            fireListeners(
                events
                , "get"
                , fullKey
                , details || fullKey
            );
        }
        //if the value is an object or function then create a proxy
        if (is_objectValue(value) || is_func(value)) {
            //but only for owned properties, to leave the prototype stuff alone
            if (target.hasOwnProperty(propName)) {
                return createProxy(
                    value
                    , options
                    , events
                    , fullKey
                );
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
            && !!arrayChangeMap.get(target)
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
        , value = includeDetails && target[propName]
        //delete the property
        , deleted = delete target[propName]
        , fullKey = getFullKey(parentName, propName)
        , details
        ;
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
    * Handles the in operator, including the event properties
    * @function
    */
    function hasTrap(options, events, parentName, target, propName) {
        return events.hasOwnProperty(propName)
            || propName in target
        ;
    }
    /**
    * Handles getOwnPropertyNames and getOwnPropertySymbols for the target and adds the event properties
    * @function
    */
    function ownKeysTrap(options, events, parentName, target) {
        var eventProps = Object.getOwnPropertyNames(events)
        , targetProps = Object.getOwnPropertyNames(target)
        , targetSymbolProps = Object.getOwnPropertySymbols(target)
        , combined = targetProps
            .concat(targetSymbolProps)
        ;

        for(let i = 0, l = eventProps.length; i < l; i++) {
            if (combined.indexOf(eventProps[i]) === -1) {
                combined.push(eventProps[i]);
            }
        }

        return combined;
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
        var changeList = arrayChangeMap.get(target);
        //if this is not a length change then it is part of a change cycle
        if (propName !== 'length') {
            //if there isn't a change list, this is the start of a cycle
            if (!changeList) {
                arrayChangeMap.set(target, (changeList = []));
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
        }
        //otherwise this is the end of a change cycle
        else {
            //remove the array change map for this target
            arrayChangeMap.delete(target);
            processArrayChangeCycle(
                options
                , events
                , parentName
                , target
                , changeList
            );
        }

        //set the value
        target[propName] = value;

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
        var changeList = arrayChangeMap.get(target)
        , fullkey = getFullKey(
            parentName
            , propName
        );
        //add a change record to the list
        changeList.push(
            {
                "action": "delete"
                , "key": fullkey
                , "oldValue": target[propName]
            }
        );
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
        //if there is only one entry then this is an append
        else if (changeList.length === 1) {
            fullKey = firstEntry.key;
            value = firstEntry.value;
            action = "set";
            arrayAction = "append";
            miss = true;
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
}