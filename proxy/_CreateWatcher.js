/**
* Create watcher builds a proxy with the included options, target, and event properties.
*/
function _CreateWatcher(
    proxy
    , is_object
    , is_func
    , utils_apply
    , utils_copy
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
    };

    return CreateWatcher;

    /**
    * @worker
    */
    function CreateWatcher(target, events, options = false) {
        ///INPUT VALIDATION
        if (!is_object(options)) {
            options = {
                "preserveTarget": !!options
            };
        }
        options = utils_apply(
            options
            , utils_copy(defaults.core.proxy.watcher)
        );
        ///END INPUT VALIDATION
        //copy the target so no un-monitored changes can be made
        var internalTarget = !options.preserveTarget
            ? utils_copy(
                target
            )
            : target
        , targetProto
        , internalTargetProto
        ;
        //set the prototype of the copy
        if (!options.preserveTarget) {
            targetProto = Object.getPrototypeOf(target);
            internalTargetProto = Object.getPrototypeOf(internalTarget);
            //not needed if the proto is the same
            if (targetProto !== internalTargetProto) {
                Object.setPrototpeOf(
                    internalTarget
                    , targetProto
                );
            }
        }

        return createProxy(
            internalTarget
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
            return events[propName];
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
                    "key": fullKey
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
        if (is_object(value) || is_func(value)) {
            return createProxy(
                value
                , options
                , events
                , fullKey
            );
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
        , oldValue = hasProp && target[propName]
        //details start out as just the full key
        , fullKey = getFullKey(
            parentName
            , propName
        )
        , details
        ;
        //set the value
        target[propName] = value;

        //if this is part of the traps list
        if (options.traps.indexOf("set") !== -1) {
            //see if we are including details
            if (includeDetails) {
                details = {
                    "key": fullKey
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
        //see if we are including event details
        var includeDetails = options.includeDetails.indexOf("deleteProperty") !== -1
        //  and if we are get the value before it's deleted
        , value = includeDetails && target[propName]
        //delete the property
        , deleted = delete target[propName]
        , fullKey = getFullKey(parentName, propName)
        , details
        ;
        //if this is part of the traps list
        if (options.traps.indexOf("deleteProperty") !== -1) {
            //see if we are including details
            if (includeDetails) {
                details = {
                    "key": fullKey
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
                    "key": fullKey
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
                    "key": fullKey
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
        , combined = eventProps
            .concat(targetProps)
            .concat(targetSymbolProps)
        ;

        return combined;
    }
    /**
    * Appends the parent name to the prop name if exists
    * @function
    */
    function getFullKey(parentName, propName) {
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
}