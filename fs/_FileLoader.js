/**
*
* @factory
*/
function _FileLoader(
    promise
    , nodeFs
) {

    /**
    * @function
    *   @async
    */
    return function FileLoader(path, options) {
        if (!options) {
            options = "utf8";
        }
        //start a promise
        return new promise(function thenReadFile(resolve, reject) {
            //start the read process
            nodeFs.readFile(
                path
                , options
                , function readFileCb(err, data) {
                    try {
                        if (!err) {
                            resolve(data);
                            return;
                        }
                    }
                    catch(ex) {
                        err = ex;
                    }
                    reject(err);
                }
            );
        });
    };
}