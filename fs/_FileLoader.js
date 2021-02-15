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
            try {
                var resolvedPath = node_path.resolve(path);
                //start the read process
                if (options === "raw") {
                    node_fs.readFile(
                        resolvedPath
                        , readFileCb
                    );
                }
                else {
                    node_fs.readFile(
                        resolvedPath
                        , options
                        , readFileCb
                    );
                }

                function readFileCb(err, data) {
                    if (!err) {
                        resolve(data);
                    }
                    else {
                        reject(err);
                    }
                }
            }
            catch(ex) {
                reject(ex);
            }
        });
    };
}