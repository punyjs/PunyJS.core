/**
*
* @factory
*/
function _FileLoader(
    promise
    , node_path
    , node_fs
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
            node_fs.readFile(
                node_path.resolve(path)
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