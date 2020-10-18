/**
* A utility that converts an array of arrays, an array of records, to a CSV string.
* @factory
*   @utility
*/
function _ArrayArraytoCsvString(
    is_array
    , is_object
    , is_numeric
    , errors
) {

    return ArrayArraytoCsvString;

    /**
    * @worker
    *   @param {array} records The array of records, array of arrays.
    */
    function ArrayArraytoCsvString(records) {
        if (!is_array(records)) {
            throw new Error(
                `${errors.data.convert.invalid_convert_input} Array<Array>`
            );
        }
        return records
        .map(function mapRecord(record, indx) {
            if (!is_array(record)) {
                throw new Error(
                    `${errors.data.convert.invalid_convert_input} Array<Array>  record# ${indx + 1}`
                );
            }
            return convertRecord(
                record
            );
        })
        .join("\n")
        ;
    }

    /**
    * @function
    */
    function convertRecord(record) {
        //loop through the record values and convert each
        return record
        .map(function mapRecordValues(value) {
            return convertValue(
                value
            );
        })
        .join(",");
    }
    /**
    * @function
    */
    function convertValue(value) {
        if (value === undefined) {
            value = null;
        }
        else if (is_array(value) || is_object(value)) {
            value = JSON.stringify(value);
        }
        else if (!is_numeric(value)) {
            value = `"${value}"`;
        }
        return `${value}`;
    }
}