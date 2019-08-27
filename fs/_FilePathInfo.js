/**
* The file path info takes a file path, and optionally some options, and inspects the path, if a directory, it lists the contents. If the options mark the operation as `recursive` then it will travers all child directories.
* @factory
*/
function _FilePathInfo(
    promise
    , nodeFs
    , nodePath
    , utils_applyIf
    , is_regexp
    , is_array
) {

    var defaultOptions = {
        "recurse": false
    };

    /**
    * @worker
    */
    return function FilePathInfo(path, options) {
        //get the standard options object
        options = configureOptions(
            options
        );
        //start the directory listing process
        return new promise(
            listDirectory.bind(null, path, options)
        );
    };

    /**
    * Produce the options object, adding defaults
    * @function
    */
    function configureOptions(options) {
        //when the options value is `true` create the object with recurse true
        if (options === true) {
            options = {
                "recurse": true
            };
        }
        //when the options value is a string create the object with filter:option
        if (typeof options === "string") {
            options = {
                "filter": options
            };
        }
        //otherwise, the options value must be an object
        if (typeof options !== "object") {
            options = {};
        }
        //make the filer an array if it's not regex
        if (
            !!options.filter
            && !is_array(options.filter)
            && !is_regexp(options.filter)
        ) {
            options.filter = options.filter.split(",");
        }
        //add the defaults
        utils_applyIf(defaultOptions, options);

        return options;
    }
    /**
    * Starts the
    * @function
    */
    function listDirectory(dirPath, options, resolve, reject) {
        //see if this is a directory
        getStat(
            dirPath
            , getStatCb
        );
        //handle the isDir callback
        function getStatCb(err, path, stat) {
            if (!!err) {
                final(err);
            }
            else if (stat.isDirectory()) {
                //read the path
                readDir(dirPath, options, final);
            }
            else {
                final(null, { "path": dirPath, "isDirectory": false });
            }
        }
        //the final callback
        function final(err, dir) {
            if (!!err) {
                if (err.errno === -4058) {
                    resolve({ "path": dirPath, "missing": true });
                }
                else {
                    reject(err);
                }
            }
            else {
                resolve(dir);
            }
        }
    }
    /**
    * read the path, determine the type, lookup sub dirs if recurse is true
    * @function
    */
    function readDir(dirPath, options, cb) {
        var len
        , results = []
        , dir = {
            "path": dirPath
            , "isDirectory": true
        };

        //start the dir read
        nodeFs.readdir(
            dirPath
            , readDirCb
        );

        //handler for the readDir callback
        function readDirCb(err, files) {
            //if there was an error then just run the callback
            if (!!err) {
                cb(err);
                return;
            }
            //record the # of files
            len = files.length;
            //if there are files, get the type for each
            if (len > 0) {
                dir.children = [];
                files.forEach(checkEachFile);
            }
            else {
                dir.empty = true;
                cb(null, dir);
            }
        }

        //iterator function to check the file type
        function checkEachFile(file) {
            getStat(
                nodePath.join(
                    dirPath
                    , file
                )
                , checkEachFileCb
            );
        }

        //handler for the file check callback
        function checkEachFileCb(err, curPath, stat) {
            //if there was an error then just run the callback
            if (!!err) {
                cb(err);
                return;
            }
            //if it's not a dir then it's a file so we'll record that
            if (!stat.isDirectory()) {
                var ext = nodePath.extname(curPath)
                , file = null;
                //check the filter
                if (!!options.filter) {
                    if (is_regexp(options.filter)) {
                        if (options.filter.test(ext)) {
                            file = {
                                "path": curPath
                                , "isDirectory": false
                            };
                        }
                    }
                    else if (options.filter.indexOf(ext) !== -1) {
                        file = {
                            "path": curPath
                            , "isDirectory": false
                        };
                    }
                }
                finished(null, file);
            }
            //if it is a dir then run the readDir, but only if recurse is true
            else if (options.recurse) {
                readDir(
                    curPath
                    , options
                    , finished
                );
            }
            //a directory but no recurse so don't pass any args
            else {
                finished();
            }
        }

        //handler for the end of the process
        function finished(err, file) {
            //if there was an error then just run the callback
            if (!!err) {
                len = -1; //set this so non of the other callbacks will call cb
                cb(err);
                return;
            }

            //update the results
            if (!!file) {
                dir.children.push(file);
            }

            len--;
            if (len === 0) {
                cb(null, dir);
            }
        }
    }
    /**
    *
    * @function
    */
    function getStat(path, cb) {
        nodeFs.stat(path, function(err, stat) {
            if (!!err) {
                cb(err, path);
            }
            else {
                cb(null, path, stat);
            }
        });
    }
}