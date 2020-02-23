/**
*
* @factory
*/
function _FileWriter(
    promise
    , node_fs
    , node_path
) {
    /**
    * @constants
    */
    var cnsts = {
        "defaultOptions": {
            recursive: true
        }
    };

    /**
    * @worker
    */
    return function FileWriter(path, data, options) {
        options = options || cnsts.defaultOptions;

        //ensure the directory exists
        return new promise(
            makeDirectory.bind(null, path, options)
        )
        //then write the file
        .then(function thenWriteFile() {
            return new promise(
                writeFile.bind(null, path, data)
            );
        });
    };

    /**
    * @function
    */
    function makeDirectory(path, options, resolve, reject) {
        try {
            node_fs.mkdir(
                node_path.dirname(path)
                , options
                , function makeDirCb(err) {
                    if (!!err) {
                        throw err;
                    }
                    resolve();
                }
            );
        }
        catch(ex) {
            reject(ex);
        }
    }
    /**
    * @function
    */
    function writeFile(path, data, resolve, reject) {
        try {
            node_fs.writeFile(
                path
                , data
                , function writeFileCb(err) {
                    if (!!err) {
                        throw err;
                    }
                    resolve();
                }
            );
        }
        catch(ex) {
            reject(ex);
        }
    }
}