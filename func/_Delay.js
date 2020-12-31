/**
* Creates a delay object which wraps a function and delays it with a setTimeout, each time the delay is called the
*   setTimeout is canceled and a new one starts. Scope and parameters can be changed when the function is delayed
* @factory
*/
function _Delay(
    setTimeout
    , clearTimeout
) {


    return Delay;

    /**
    * @worker
    * @param {function} fn The function that will be ran after the delay
    */
    function Delay(fn, args, scope) {
        //create a token to hold the relevent information
        var token = {
            "id": null
            , "status": 'created'
            , "args": args
            , "scope": scope
            , "fn": fn
        }
        , self = Object.create(
            null
            , {
                "delay": {
                    "enumerable": true
                    , "value": delay.bind(null, token)
                }
                , "execute": {
                    "enumerable": true
                    , "value": execute.bind(null, token)
                }
                , "cancel": {
                    "enumerable": true
                    , "value": cancel.bind(null, token)
                }
                , "reset": {
                    "enumerable": true
                    , "value": reset.bind(null, token)
                }
                , "args": {
                    "enumerable": true
                    , "get": function () { return token.args; }
                }
                , "scope": {
                    "enumerable": true
                    , "get": function () { return token.scope; }
                }
                , "status": {
                    "enumerable": true
                    , "get": function () { return token.status; }
                }
                , "destroy": {
                    "enumerable": true
                    , "value": function () {
                        cancel(token);
                        token = undefined;
                    }
                }
            }
        )
        ;

        token.self = self;

        //create the interface
        return self;
    };

    /**
    * Cancels the current `setTimeout` and starts a new one with `ms`, updating the `args` and `scope` when included
    * @function
    * @param {number} ms The number of milliseconds for which to delay the `fn`
    * @param {array} [args] Optional. The array of arguments with which the `fn` will be called
    * @params {object} [scope] Optional. The scope in which the `fn` will be called
    */
    function delay(token, ms, args, scope) {
        //clear any previous timeouts
        clear(token);
        token.status = 'delayed';

        updateToken(token, args, scope);

        token.id = setTimeout(run, ms, token);

        return token.self;
    }
    /**
    * Clears the timeout if an `id` is present
    * @function
    */
    function cancel(token) {
        if (!!token.id) {
            clear(token);
            token.status = 'canceled';
        }

        return token.self;
    }
    /**
    * Sets the args and scope to what was passed to the Delay worker
    * @function
    */
    function reset(token) {
        token.args = args;
        token.scope = scope;
    }
    /**
    * Executes the `fn` immediately, clearing the timeout if there's an `id`
    * @function
    * @param {array} [args] Optional. The array of arguments with which the `fn` will be called
    * @params {object} [scope] Optional. The scope in which the `fn` will be called
    */
    function execute(token, args, scope) {
        if (!!token.id) {
            clear(token);
        }

        updateToken(token, args, scope);

        run(token);

        return token.self;
    }
    /**
    * @function
    */
    function run(token) {
        token.fn.apply(
            token.scope || null
            , token.args || []
        );
        token.status = 'executed';
    }
    /**
    * Clears the timeout if there is an `id`
    * @function
    */
    function clear(token) {
        if (!!token.id) {
            clearTimeout(token.id);
            token.id = null;
        }
    }
    /**
    * Updated the `token` with the `scope` and `args` if not present
    * @function
    */
    function updateToken(token, args, scope) {
        !!args && (token.args = args);
        !!scope && (token.scope = scope);
    }
}