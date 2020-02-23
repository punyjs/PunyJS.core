/**
* The file info creates an instance of `{iFileInfo}` for the provided path and data
* @factory
* @interface iFileInfo
*   @property {object} path An instance of `{iFilePath}`
*   @property {string|binary} data The file data, if loaded
*   @property {string} encoding The file data encoding
*/
function _FileInfo(
    node_path
) {

    /**
    * @worker
    */
    return function FileInfo(path, data) {
        var fileInfo = {
            "data": data
        };

        //convert the path to a path object if it's a string
        if (typeof path === "string") {
            path = node_path.parse(path);
        }

        if (!path.ext && !!path.base) {
            path.ext = node_path.extname(path.base);
        }

        if (!path.name && !!path.base) {
            path.name = path.base.replace(path.ext,"");
        }

        if (!path.base && !!path.name) {
            path.base = path.name;
            if (!!path.ext) {
                path.base+= path.ext;
            }
        }

        //add the path to the fileInfo
        fileInfo.path = path;

        return fileInfo;
    };
}