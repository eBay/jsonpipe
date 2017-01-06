!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.jsonpipe=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
/* eslint no-param-reassign:0 */
'use strict';

var xhr = _dereq_('./net/xhr'),
    utils = _dereq_('./utils.js');

function getParser(parserType) {
    switch (parserType.toLowerCase()) {
        case 'json-array':
            return _dereq_('./parsers/json-array');
        default:
            return _dereq_('./parsers/json-chunk');
    }
}

/**
 * @param {String} url A string containing the URL to which the request is sent.
 * @param {Object} url A set of key/value pairs that configure the Ajax request.
 * @return {XMLHttpRequest} The XMLHttpRequest object for this request.
 * @method ajax
 */
function ajax(url, options) {
    // Do all prerequisite checks
    if (!url) {
        return undefined;
    }

    // Set arguments if first argument is not string
    if (!utils.isString(url)) {
        options = url;
        url = options.url;
    }

    // Check if all mandatory attributes are present
    if (!url ||
        !options ||
        !(options.success || options.error || options.complete)) {
        return undefined;
    }

    var Parser = getParser(options.parserType || 'json-chunk'), // Retrieve the Parser based on parser type
        parser = new Parser(options); // Create a new Parser instance

    // Assign onChunk to options with parse function, binded to the parser object
    options.onChunk = parser.parse.bind(parser);

    return xhr.send(url, options);
}

module.exports = {
    flow: ajax
};

},{"./net/xhr":2,"./parsers/json-array":3,"./parsers/json-chunk":4,"./utils.js":5}],2:[function(_dereq_,module,exports){
'use strict';

var utils = _dereq_('../utils.js');

function parseHeader(str) {
    var lines = str.split(/\r?\n/);
    var fields = {};
    var index;
    var line;
    var field;
    var val;

    lines.pop(); // trailing CRLF

    for (var i = 0, len = lines.length; i < len; ++i) {
        line = lines[i];
        index = line.indexOf(':');
        field = line.slice(0, index).toLowerCase();
        val = utils.trim(line.slice(index + 1));
        fields[field] = val;
    }

    return fields;
}

function send(url, options) {
    if (!url || !options) {
        return undefined;
    }

    var xhr = new XMLHttpRequest(),
        state = {
            UNSENT: 0,
            OPENED: 1,
            HEADERS_RECEIVED: 2,
            LOADING: 3,
            DONE: 4
        },
        noop = function() {},
        method = (options.method || '').toUpperCase(),
        headers = options.headers,
        onChunk = options.onChunk || noop,
        onHeaders = options.onHeaders || noop,
        errorFn = options.error || noop,
        completeFn = options.complete || noop,
        addContentHeader = method === 'POST',
        isChunked = false,
        timer;

    xhr.open(method || 'GET', url, true);

    // Attach onreadystatechange
    xhr.onreadystatechange = function() {
        var encoding,
            chromeObj,
            loadTimes,
            chromeSpdy;
        if (xhr.readyState === state.HEADERS_RECEIVED) {
            encoding = xhr.getResponseHeader('Transfer-Encoding') || '';
            encoding = encoding.toLowerCase();
            isChunked = encoding.indexOf('chunked') > -1 ||
                        encoding.indexOf('identity') > -1; // fix for Safari
            if (!isChunked) {
                // SPDY inherently uses chunked transfer and does not define a header.
                // Firefox provides a synthetic header which can be used instead.
                // For Chrome, a non-standard JS function must be used to determine if
                // the primary document was loaded with SPDY.  If the primary document
                // was loaded with SPDY, then most likely the XHR will be as well.
                chromeObj = window.chrome;
                loadTimes = chromeObj && chromeObj.loadTimes && chromeObj.loadTimes();
                chromeSpdy = loadTimes && loadTimes.wasFetchedViaSpdy;
                isChunked = !!(xhr.getResponseHeader('X-Firefox-Spdy') || chromeSpdy);
            }
            onHeaders(xhr.statusText, parseHeader(xhr.getAllResponseHeaders()));
        } else if (xhr.readyState === state.LOADING) {
            if (isChunked && xhr.responseText) {
                onChunk(xhr.responseText);
            }
        } else if (xhr.readyState === state.DONE) {
            // clear timeout first
            clearTimeout(timer);
            // Check for error first
            if (xhr.status < 200 || xhr.status > 299) {
                errorFn(xhr.statusText);
            } else {
                onChunk(xhr.responseText, true);
            }
            // Call complete at the end
            completeFn(xhr.statusText);
        }
    };

    // Add headers
    if (headers) {
        for (var key in headers) { // eslint-disable-line guard-for-in
            xhr.setRequestHeader(key, headers[key]);
            if (key.toLowerCase() === 'content-type') {
                addContentHeader = false;
            }
        }
    }
    if (addContentHeader) {
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    }

    // Add timeout
    if (options.timeout) {
        timer = setTimeout(function() {
            xhr.abort();
            clearTimeout(timer);
        }, options.timeout);
    }

    // Set credentials
    if (options.hasOwnProperty("withCredentials")) {
        xhr.withCredentials = options.withCredentials;
    } else {
        xhr.withCredentials = true;
    }

    xhr.send(options.data);

    return xhr;
}

module.exports = {
    send: send
};

},{"../utils.js":5}],3:[function(_dereq_,module,exports){
'use strict';

var utils = _dereq_('../utils.js');

function isDoubleQuoteEscaped(text) {
    var currentIndex = text.length - 1, // Start from the back of the string
        backslashCount = 0;

    // If last character is double quote then move back
    if (text[currentIndex] === '"') {
        currentIndex--;
    }

    while (currentIndex > 0) {
        // if not backslash break it
        if (text[currentIndex] !== '\\') {
            break;
        }
        backslashCount++;
        currentIndex--;
    }
    // If odd number of backslashes then the double quote is escaped
    return backslashCount % 2;
}

// Get the first unescaped end double quote index
function getStringEndIndex(text) {
    if (!text) {
        return 0;
    }

    var currentIndex = 0;

    // if text starts with a double quote, then skip to next postion
    if (text[currentIndex] === '"') {
        currentIndex++;
    }

    while (currentIndex < text.length) {
        // Check for closing double quote and check if it is not escaped
        if (text[currentIndex] === '"' && !isDoubleQuoteEscaped(text.substring(0, currentIndex))) {
            break;
        }
        currentIndex++;
    }
    return currentIndex;
}

function Parser(options) {
    this.offset = 0;
    this.success = options.success;
    this.error = options.error;
}

Parser.prototype.parse = function(text, finalChunk) {
    var chunk = text.substring(this.offset),
        curlyBraceCount = 0,
        startIndex = -1,
        offsetPointer = 0,
        finalRemainingChunk;

    for (var currentIndex = 0; currentIndex < chunk.length; currentIndex++) {
        if (chunk[currentIndex] === '{') {
            // if curlyBraceCount is zero, then the object is just getting started
            if (curlyBraceCount === 0) {
                startIndex = currentIndex;
            }
            curlyBraceCount++;
        }

        if (chunk[currentIndex] === '}') {
            curlyBraceCount--;
        }

        // If string we need do special treatment to check for curly braces inside a string
        // So just move to the end of the string
        if (chunk[currentIndex] === '"') {
            currentIndex = currentIndex + getStringEndIndex(chunk.substring(currentIndex));
        }

        if (curlyBraceCount === 0 && startIndex > -1) {
            utils.parse(chunk.substring(startIndex, currentIndex + 1), this.success, this.error);

            // Set the offsetPointer to the next pointer of currentIndex
            offsetPointer = currentIndex + 1;

            // Rest startIndex
            startIndex = -1;
        }
    }

    if (offsetPointer > 0) {
        // Increment offset state by offsetPointer
        this.offset = this.offset + offsetPointer;
    }

    // if finalChunk, check the remaining chunk for incomplete or invalid JSON
    if (finalChunk) {
        finalRemainingChunk = text.substring(this.offset); // Get the final remaining chunk

        // If finalRemainingChunk is present, perform 2 checks
        // 1. Check if the curlyBraceCount is not zero, which mean incomplete JSON
        // OR
        // 2. Check if finalRemainingChunk is not closing square bracket, which means invalid JSON
        if (finalRemainingChunk &&
            (curlyBraceCount !== 0 || utils.trim(finalRemainingChunk) !== ']')) {
            utils.parse(finalRemainingChunk, this.success, this.error);
        }
    }
};

module.exports = Parser;


},{"../utils.js":5}],4:[function(_dereq_,module,exports){
'use strict';

var utils = _dereq_('../utils.js');

function Parser(options) {
    this.offset = 0;
    this.token = options.delimiter || '\n\n';
    this.success = options.success;
    this.error = options.error;
}

Parser.prototype.parse = function(text, finalChunk) {
    var chunk = text.substring(this.offset),
        start = 0,
        finish = chunk.indexOf(this.token, start),
        subChunk;

    if (finish === 0) { // The delimiter is at the beginning so move the start
        start = this.token.length;
    }

    // Re-assign finish to the next token
    finish = chunk.indexOf(this.token, start);

    while (finish > -1) {
        subChunk = chunk.substring(start, finish);
        if (subChunk) {
            utils.parse(subChunk, this.success, this.error);
        }
        start = finish + this.token.length; // move the start
        finish = chunk.indexOf(this.token, start); // Re-assign finish to the next token
    }
    this.offset += start; // move the offset

    // Get the remaning chunk
    chunk = text.substring(this.offset);
    // If final chunk and still unprocessed chunk and no delimiter, then execute the full chunk
    if (finalChunk && chunk && finish === -1) {
        utils.parse(chunk, this.success, this.error);
    }
};

module.exports = Parser;


},{"../utils.js":5}],5:[function(_dereq_,module,exports){
'use strict';

function isString(str) {
    return Object.prototype.toString.call(str) === '[object String]';
}

function isFunction(fn) {
    return Object.prototype.toString.call(fn) === '[object Function]';
}

function trim(str) {
    if (!str) {
        return str;
    }
    if (str.trim) {
        return str.trim();
    }
    return str.replace(/(^\s*|\s*$)/g, '');
}

// Do the eval trick, since JSON object not present
function customParse(chunk) {
    if (!chunk || !/^[\{|\[].*[\}|\]]$/.test(chunk)) {
        throw new Error('parseerror');
    }
    return eval('(' + chunk + ')'); // eslint-disable-line no-eval
}

function parse(chunk, successCb, errorCb) {
    var jsonObj;
    try {
        jsonObj = typeof JSON !== 'undefined' ? JSON.parse(chunk) : customParse(chunk);
    } catch (ex) {
        if (isFunction(errorCb)) {
            errorCb('parsererror');
        }
        return;
    }
    // No parse error proceed to success
    if (jsonObj && isFunction(successCb)) {
        successCb(jsonObj);
    }
}

module.exports = {
    isString: isString,
    isFunction: isFunction,
    trim: trim,
    parse: parse
};

},{}]},{},[1])
(1)
});