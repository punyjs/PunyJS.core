/**
* A UUID generator, following RFC-4122
* @factory
* @singleton
*/
function _Uuid(
    timing_gregorianReform
    , timing_timestamper
    , security_fillRandomBytesSync
    , is_bool
    , is_object
    , is_nill
    , is_string
    , errors
    , defaults
) {
    /**
    * The number of 100ns intervals between the gregorian reform and Jan 1 1970.
    * @constant
    */
    const gregorian100NsIntervals = BigInt(
        Math.abs(
            timing_gregorianReform * 10
        )
    );
    /**
    * A regular expression pattern for removing uuid added characters x and -
    * @property
    */
    var UUID_CHR_PATT = /[x-]/g;

    /**
    * @worker
    *   @param {boolean} [options] If true, the GUID will not start with a number, so that it can be used as an id in a DOM. If an object, used as options.
    *   @returns {string} The resulting UUID
    */
    return function Uuid(options) {
        options = initOptions(
            options
        );
        var uuidInt8Array = generateUuid(
            options
        )
        //convert the int8 arrays to hex
        , uuidHexArray = convertInt8ArrayToHexArray(
            uuidInt8Array
        );

        if (!!options.format) {
            //Add an x to ensure the uuid does not start with a number
            if (options.format.indexOf("id") !== -1) {
                uuidHexArray = uuidHexArray.unshift("x");
            }
            //return the uuid without the dashes
            if (options.format.indexOf("clean") !== -1) {
                return uuidHexArray.join("");
            }
        }

        return uuidHexArray.join("-");
    };

    /**
    * @function
    */
    function initOptions(options) {
        ///INPUT VALIDATION
        if (is_nill(options)) {
            options = {};
        }
        if (is_bool(options)) {
            options = {
                "format": options || defaults.data.uuid.uuidFormat
            };
        }
        if (!is_object(options)) {
            throw new Error(
                `${errors.data.uuid.invalid_options_argument} (${typeof options})`
            );
        }
        ///END INPUT VALIDATION
        ///DEFAULTS
        if (!options.version) {
            options.version = defaults.data.uuid.uuidVersion;
        }
        if (!options.format) {
            options.format = defaults.data.uuid.uuidFormat;
        }
        ///END DEFAULTS
        //if there is a last id then get the clock sequence
        if (!!options.lastId) {
            options.clockSeq = getClockSeq(
                options.lastId
            );
        }
        //convert the clock sequence if it's a string
        if (is_string(options.clockSeq)) {
            options.clockSeq = parseInt(options.clockSeq);
        }

        return options;
    }
    /**
    * @function
    * @reference https://tools.ietf.org/html/rfc4122#section-4.1.2
        0                   1                   2                   3
         0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
         +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
         |                          time_low (0-3)                       |
         +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
         |       time_mid (4-5)          |     time_hi_and_version (6-7) |
         +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
         |clk_seq_hi_res |  clk_seq_low  |         node (10-11)          |
         +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
         |                         node (12-15)                          |
         +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
    */
    function generateUuid(options) {
        var version = options.version
        , uuid = [
            new Uint8Array(4).fill(0) //time_low
            , new Uint8Array(2).fill(0) //time_mid
            , new Uint8Array(2).fill(0) //time_hi_and_version
            , new Uint8Array(2).fill(0) //clk_seq_hi_res & clk_seq_low
            , new Uint8Array(6).fill(0) //node
        ];

        //time based version
        if (version == "1") {
            addSystemTime(
                uuid
                , options
            );
            addClockSeq(
                uuid
                , options
            );
            addNode(
                uuid
                , options
            );
        }
        //DCE Security version, with embedded POSIX UIDs.
        else if(version == "2") {
            throw new Error(
                `${errors.data.uuid.version_not_implemented} (version 2)`
            );
        }
        //The name-based version using MD5
        else if(version == "3") {
            addMd5Hash(
                uuid
                , options
            );
        }
        //The randomly or pseudo-randomly generated version
        else if(version == "4") {
            addRandom(
                uuid
                , options
            );
        }
        //The name-based version using sha-1
        else if(version == "5") {
            addSha1Hash(
                uuid
                , options
            );
        }
        //no other versions
        else {
            throw new Error(
                `${errors.data.uuid.invalid_uuid_version} (${version})`
            );
        }

        //set the version to the most signifigate 4 bits
        uuid[2][0] = parseInt(version + "0", 16) | uuid[2][0];
        //add the variant to the MSB, which is always 1xxx xxxx
        uuid[3][0] = uuid[3][0] | 0x80;

        return uuid;
    }
    /**
    * @function
    */
    function addSystemTime(uuid, options) {
        //the number of 100 ns intervals since 1/1/1970
        var timestamp = BigInt(
            Math.round(timing_timestamper() * 10)
        )
        //adding the 100ns intervals between the gregorian reform and 1/1/1970
        , timestampGregorian = (
            timestamp
            + gregorian100NsIntervals
        )
        //get the hex string and ensure it is 15 bytes in length
        , timestampHex = timestampGregorian
            .toString(16)
            .padStart(16, "0")
        , timeHigh = timestampHex.substring(0, 4)
        , timeMid = timestampHex.substring(4, 8)
        , timeLow = timestampHex.substring(8)
        ;

        uuid[0][0] = parseInt(timeLow[0] + timeLow[1], 16);
        uuid[0][1] = parseInt(timeLow[2] + timeLow[3], 16);
        uuid[0][2] = parseInt(timeLow[4] + timeLow[5], 16);
        uuid[0][3] = parseInt(timeLow[6] + timeLow[7], 16);

        uuid[1][0] = parseInt(timeMid[0] + timeMid[1], 16);
        uuid[1][1] = parseInt(timeMid[2] + timeMid[3], 16);

        uuid[2][1] = parseInt(timeHigh[2] + timeHigh[3], 16);
        uuid[2][0] = parseInt(timeHigh[1], 16);
    }
    /**
    * @function
    */
    function addClockSeq(uuid, options) {
        //if there isn't a clock seq then generate a random number to be safe
        if (is_nill(options.clockSeq)) {
             security_fillRandomBytesSync(uuid[3]);
        }
        //otherwise increment the clock sequence
        else {
            options.clockSeq++;
            //update the clockseq octets
            uuid[3][0] = options.clockSeq >> 8 & 0xFF;
            uuid[3][1] = options.clockSeq & 0xFF;
        }
    }
    /**
    * Rehydrates the clock sequence number from the last uuid
    * @function
    *   @param {String} lastId The last uuid generated from this node
    */
    function getClockSeq(lastId) {
        if (!lastId) {
            return;
        }
        //remove leading x and dashes
        var uuid = lastId.replace(UUID_CHR_PATT, "")
        //get the clock high and clock low bytes
        , clockHighHex = uuid[16] + uuid[17]
        , clockLowHex = uuid[18] + uuid[19]
        , clockHigh = parseInt(clockHighHex, 16)
        ;
        //remove the variant by removing the sign
        clockHigh = Math.abs(clockHigh);
        clockHighHex = clockHigh.toString(16);
        //combine the octets and parse it
        return parseInt(
            clockHighHex + clockLowHex
            , 16
        );
    }
    /**
    * @function
    */
    function addNode(uuid, options) {
        throw new Error(
            `${errors.data.uuid.version_not_implemented} (version 1)`
        );
    }
    /**
    * @function
    */
    function addMd5Hash(uuid, options) {
        throw new Error(
            `${errors.data.uuid.version_not_implemented} (version 3)`
        );
    }
    /**
    * @function
    */
    function addSha1Hash(uuid, options) {
        throw new Error(
            `${errors.data.uuid.version_not_implemented} (version 5)`
        );
    }
    /**
    * @function
    */
    function addRandom(uuid, options) {
        security_fillRandomBytesSync(uuid[0]);
        security_fillRandomBytesSync(uuid[1]);
        security_fillRandomBytesSync(uuid[2]);
        //clear the top 4 bits of the time high version
        uuid[2][0] = uuid[2][0] & 0x0F;
        security_fillRandomBytesSync(uuid[3]);
        security_fillRandomBytesSync(uuid[4]);
    }
    /**
    * @function
    */
    function convertInt8ArrayToHexArray(uuidInt8Array) {
        return uuidInt8Array
        .map(function mapInt8Ar(int8Ar) {
            var hex = [], octet, byte;

            for(let i = 0, l = int8Ar.length; i < l; i++) {
                byte = int8Ar[i];
                octet = byte.toString(16).padStart(2, "0");
                hex.push(octet);
            }

            return hex.join("");
        });
    }
}