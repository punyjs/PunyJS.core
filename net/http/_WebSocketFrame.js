/**
* @factory
*/
function _Frame(
    promise
    , node_buffer
    , net_http_frameOpcodes
    , net_http_webSocketHandshake
    , security_crypto
    , is_string
    , reporter
    , info
    , errors
) {


    /**
    * @alias
    */
    var frameOpcodes = net_http_frameOpcodes
    /**
    * @alias
    */
    , webSocketHandshake = net_http_webSocketHandshake
    /**
    * Create a lookup var for the maximum frame size
    * @property
    */
    , MAX_SIZE_64 = BigInt(18446744073709551615)
    ;

    /**
    * @worker
    */
    return Object.create(
        null
        , {
            "handle": {
                "enumerable": true
                , "value": handle
            }
            , "send": {
                "enumerable": true
                , "value": send
            }
        }
    );

    /**
    * @function
    */
    function send(config, socket, payload) {
        var frameList = new Array(5);

        return createFrame(
            config
            , socket
            , frameList
            , payload
        )
        //then send the frame
        .then(function thenSendFrame(payloadBuffer) {
            return sendFrame(
                socket
                , frameList
                , payloadBuffer
            );
        });
    }
    /**
    * @function
    */
    function handle(config, socketApi, onMessage, data) {
        return handleFrame(
            config
            , socketApi
            , onMessage
            , data
        )
        //catch errors here since the handle function might be unattended, so we can ensure a rejected promise is caught
        .catch(function catchHandleFrameError(error) {
            reporter.error(
                error
            );
            //return the error resolved in case the handle is attended and the caller could use the error
            return promise.resolve(error);
        });
    }
    /**
    * @function
    */
    function handleFrame(config, socketApi, onMessage, frameData) {
        try {
            //this is a handshake if the socket isn't ready
            if (!socketApi.socketReady) {
                return webSocketHandshake.handle(
                    config
                    , socketApi
                    , frameData
                );
            }
            //process the frame data and create the fragment
            var fragment = processFrame(
                config
                , socketApi
                , frameData
            )
            , message
            , messagePromise
            ;

            //if there is more data in the stream then continue without processing, subsequent calls from the stream are expected
            if (fragment.hasMore) {
                return promise.resolve();
            }
            //unmask the fragment payload
            if (fragment.masked) {
                //unmask the payload
                maskPayload(
                    fragment.payload
                    , fragment.maskingKey
                );
            }
            //validate the fragment
            ///TODO: validate the frogment as per rfc6455
            ///TODO: ensure the client key matches
            ///TODO: clients should send masked payloads

            //see if this is a control code, if so handle it and return, as per RFC-6455 section 5.4. a control code can be sent between message fragments
            if (fragment.opcode > 2) {
                return handleControlCode(
                    config
                    , socketApi
                    , fragment
                );
            }

            //update the message buffer if exists
            if (!!socketApi.messageBuffer) {
                socketApi.messageBuffer =
                    node_buffer.concat(
                        [
                            socketApi.messageBuffer
                            , fragment.payload
                        ]
                    );
            }
            //otherwise start the message buffer off as the payload
            else {
                socketApi.messageBuffer = fragment.payload;
            }

            /// LOGGING
            reporter.tcp(
                `${info.core.net.http.socket_frame_received} (fin ${fragment.fin}, length ${frameData.length})`
            );
            /// END LOGGING
            //if this isn't the final fragment then stop here, frame not complete, expecting another frame
            if (!fragment.fin) {
                return promise.resolve();
            }

            //get the message from the buffer
            message = socketApi.messageBuffer;
            //cleanup, the message is complete, we can stop tracking it
            delete socketApi.messageBuffer;

            //start a promise to run the onMessage callback
            return new promise(
                executeCallback.bind(
                    null
                    , config
                    , socketApi
                    , onMessage
                    , message
                )
            )
            //then start reading the next frame if exists
            .then(function thenCheckNextFrame() {
                if (!!socketApi.nextFrame) {
                    frameData = socketApi.nextFrame;
                    delete socketApi.nextFrame;
                    return handleFrame(
                        config
                        , socketApi
                        , onMessage
                        , frameData
                    );
                }
                return promise.resolve();
            });
        }
        catch(ex) {
            return promise.reject(ex);
        }
    }
    /**
    * @function
    */
    function executeCallback(config, socketApi, onMessage, message, resolve, reject) {
        try {
            //run the message callback
            onMessage(
                config
                , socketApi
                , message
            );

            resolve();
        }
        catch(ex) {
            reject(ex);
        }
    }
    /**
    * @function
    */
    function processFrame(config, socketApi, data) {
        var frame = socketApi.frame; //the current frame being read
        //if there isn't a frame then the data has the frame header
        if (!frame) {
            socketApi.frame = frame =
                startFrameRead(
                    data
                );
            //there could be multiple frames in data
            if (frame.payloadLength < frame.payload.length) {
                //remove the other frame from the payload and add it to the nextFrame property on the socket
                frame.payload = separateFrames(
                    config
                    , socketApi
                    , frame.payload
                );
            }
        }
        //otherwise process the data as additional frame payload
        else {
            //the frame data could have another frame mixed in remove the other frame and add it to the nextFrame property on the socket
            data = separateFrames(
                config
                , socketApi
                , data
            );
            //combine the payload and the frame
            frame.payload =
                node_buffer.concat(
                    [
                        frame.payload
                        , data
                    ]
                );
        }

        //if there isn't any more data to read then stop tracking the frame
        if (frame.payloadLength == frame.payload.length) {
            frame.hasMore = false;
            delete socketApi.frame;
        }

        return frame;
    }
    /**
    * @function
    */
    function startFrameRead(data) {
        //decypher the frame headers
        var hasMaskByte = data.length > 1
        , masked = !!hasMaskByte
            && data[1]
                .toString(2)
                .padStart(8, "0")[0] === "1"
        , lenCode = !!hasMaskByte
            && data[1] & 0x7f
        , frstByte = data[0].toString(2)
        , opCode = data[0].toString(16)[1]
        , payloadLength
        , maskingKeyOffset
        , payloadOffset
        , frame
        ;

        //if the length code is 127 we are using 8 bytes
        if (lenCode === 127) {
            payloadLength = data.slice(2, 10)
                .readBigUInt64BE();
            maskingKeyOffset = 10;
        }
        //if the length code is 126 we are using 2 bytes
        else if (lenCode === 126) {
            payloadLength = data.slice(2, 4)
                .readUInt16BE();
            maskingKeyOffset = 4;
        }
        //else we are using the length code fof the length
        else {
            payloadLength = lenCode;
            maskingKeyOffset = 2;
        }

        payloadOffset = maskingKeyOffset;

        if (masked) {
            payloadOffset+= 4;
        }

        //create the frame
        frame = {
            "fin": frstByte[0] === "1"
            , "rsv1": frstByte[1] === "1"
            , "rsv2": frstByte[2] === "1"
            , "rsv3": frstByte[3] === "1"
            , "opcode": opCode
            , "opName": frameOpcodes[opCode]
            , "masked": masked
            , "maskingKey": masked
                ? data.slice(
                    maskingKeyOffset
                    , payloadOffset
                )
                : null
            , "payloadLength": payloadLength
            , "payload": data.slice(
                payloadOffset
            )
        };
        //calculate the delta to see if there is more data on the stream
        frame.hasMore = payloadLength > frame.payload.length;

        return frame;
    }
    /**
    * @function
    */
    function separateFrames(config, socketApi, data) {
        var frame = socketApi.frame
        , ttlLen = frame.payload.length + data.length
        , delta
        , len
        ;

        if (ttlLen > frame.payloadLength) {
            delta = ttlLen - Number(frame.payloadLength);
            len = data.length - delta;
            socketApi.nextFrame = data.slice(len);
            data = data.slice(0, len);
        }

        return data;
    }
    /**
    * Sends a web socket frame. Fragments the payload if needed, based on fragment size in the config. If a client socket, creates a masking key and masks the payload. Adds the web socket headers and sends the fragment on the wire.
    * @function
    */
    function createFrame(config, socket, frameList, payload) {
        try {
            var isTextPayload = !!is_string(payload)
            , payloadBuffer = isTextPayload
                ? node_buffer.from(
                    payload
                )
                : payload
            , payloadLen
            , finOpBuffer = node_buffer.from(
                isTextPayload
                    ? [0x81]
                    : [0x82]
                )
            , maskingKeyBuffer = socket.isClient
                ? node_buffer.alloc(4)
                : null
            , payloadLenBuffer = node_buffer.alloc(1)
            , extPayloadLenBuffer
            , payloadLen = payloadBuffer.length
            ;
            //add the length
            if (payloadLen < 127) {
                payloadLenBuffer[0] = payloadLen;
            }
            else if (payloadLen < 65536) {
                payloadLenBuffer[0] = 126;
                extPayloadLenBuffer = node_buffer.alloc(2);
                extPayloadLenBuffer.writeUInt16BE(payloadLen);
            }
            else if (payloadLen < MAX_SIZE_64) {
                payloadLenBuffer[0] = 127;
                extPayloadLenBuffer = node_buffer.alloc(8);
                extPayloadLenBuffer.writeBigInt64BE(
                    BigInt(payloadLen)
                );
            }
            else {
                //too large
                throw new Error(
                    `${errors.core.net.http.payload_exceeds_max_size}`
                );
            }
            //create the list of buffers to concatinate into a single frame buffer
            frameList[0] = finOpBuffer;
            frameList[1] = payloadLenBuffer;
            if (!!extPayloadLenBuffer) {
                frameList[2] = extPayloadLenBuffer;
            }
            frameList[5] = payloadBuffer;
            //create a masking key asyncronously
            if (socket.isClient) {
                //set the mask bit
                payloadLenBuffer[0] = payloadLenBuffer[0] | 0x80;
                //create the masking key by filling random bytes
                return security_crypto.fillRandomBytes(
                    maskingKeyBuffer
                )
                //then mask the frame
                .then(function thenMaskFrame() {
                    return maskFrame(
                        frameList
                        , payloadBuffer
                        , maskingKeyBuffer
                    );
                });
            }
            else {
                return promise.resolve(payloadBuffer);
            }
        }
        catch(ex) {
            return promise.reject(ex);
        }
    }
    /**
    * @function
    */
    function maskFrame(frameList, payloadBuffer, maskingKeyBuffer) {
        try {
            //mask the payload
            maskPayload(
                payloadBuffer
                , maskingKeyBuffer
            );
            //add the masking key to the frame list
            frameList[3] = maskingKeyBuffer;

            return promise.resolve();
        }
        catch(ex) {
            return promise.reject(ex);
        }
    }
    /**
    * @function
    */
    function sendFrame(socket, frameList, payloadBuffer) {
        var frameBuffer;
        //remove unused slots in the frame list
        frameList = frameList.filter(
            function filterFrameList(part) {
                return !!part;
            }
        );
        //concatinate the frame list
        frameBuffer = node_buffer.concat(
            frameList
        );
        socket.write(frameBuffer);
    }
    /**
    * @function
    */
    function handleControlCode(config, socketApi, fragment) {
        try {
            ///TODO: implement logic for other control codes
            if (fragment.opcode === "8") {
                socketApi.close();
            }

            return promise.resolve();
        }
        catch(ex) {
            return promise.reject(ex);
        }
    }
    /**
    * @function
    */
    function maskPayload(payload, maskingKey) {
        //mask/unmask the payload
        for(let i = 0, l = payload.length, j; i < l; i++) {
            j = i % 4;
            payload[i] = payload[i] ^ maskingKey[j];
        }
    }
}