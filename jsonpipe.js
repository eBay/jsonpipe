!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.jsonpipe=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
/* eslint no-param-reassign:0 */
'use strict';

var xhr = _dereq_('./net/xhr'),
    utils = _dereq_('./utils.js'),
    Parser = _dereq_('./parsers/json-chunk'),
    /**
     * @param {String} url A string containing the URL to which the request is sent.
     * @param {Object} url A set of key/value pairs that configure the Ajax request.
     * @return {XMLHttpRequest} The XMLHttpRequest object for this request.
     * @method ajax
     */
    ajax = function (url, options) {
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

        // Init the parser
        var parser = new Parser(options);

        // Assign onChunk to options with parse function, binded to the parser object
        options.onChunk = parser.parse.bind(parser);

        return xhr.send(url, options);
    };

module.exports = {
    flow: ajax
};

},{"./net/xhr":2,"./parsers/json-chunk":3,"./utils.js":4}],2:[function(_dereq_,module,exports){
'use strict';

var trim = ''.trim
    ? function (s) {
        return s.trim();
    }
    : function (s) {
        return s.replace(/(^\s*|\s*$)/g, '');
    };

function parseHeader(str) {
    var lines = str.split(/\r?\n/);
    var fields = {};
    let index;
    let line;
    let field;
    let val;

    lines.pop(); // trailing CRLF

    let i = 0;
    var len = lines.length;
    for (; i < len; ++i) {
        line = lines[i];
        index = line.indexOf(':');
        field = line.slice(0, index).toLowerCase();
        val = trim(line.slice(index + 1));
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
        noop = function () {
        },
        method = (options.method || '').toUpperCase(),
        headers = options.headers,
        onChunk = options.onChunk || noop,
        onHeaders = options.onHeaders || noop,
        errorFn = options.error || noop,
        completeFn = options.complete || noop,
        disableContentType = options.disableContentType || false,
        onUploadProgress = options.onUploadProgress;
    let addContentHeader = method === 'POST',
        timer;

    // Not all browsers support upload events
    if (typeof onUploadProgress === 'function' && xhr.upload) {
        xhr.upload.addEventListener('progress', onUploadProgress);
    }

    xhr.open(method || 'GET', url, true);

    // Attach onreadystatechange
    xhr.onreadystatechange = function () {
        if (xhr.readyState === state.HEADERS_RECEIVED) {
            onHeaders(xhr.statusText, parseHeader(xhr.getAllResponseHeaders()));
        } else if (xhr.readyState === state.LOADING) {
            if (xhr.responseText) {
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
        for (let key in headers) { // eslint-disable-line guard-for-in
            xhr.setRequestHeader(key, headers[key]);
            if (key.toLowerCase() === 'content-type') {
                addContentHeader = false;
            }
        }
    }
    if (!disableContentType && addContentHeader) {
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    }

    // Add timeout
    if (options.timeout) {
        timer = setTimeout(function () {
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

},{}],3:[function(_dereq_,module,exports){
'use strict';

        var utils = _dereq_('../utils.js');

function Parser(options) {
    this.offset = 0;
    this.token = options.delimiter || '\n\n';
    this.success = options.success;
    this.error = options.error;
}

        Parser.prototype.parse = function (text, finalChunk) {
            let chunk = text.substring(this.offset),
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

            // Get the remaining chunk
            chunk = text.substring(this.offset);
            // If final chunk and still unprocessed chunk and no delimiter, then execute the full chunk
            if (finalChunk && chunk && finish === -1) {
                utils.parse(chunk, this.success, this.error);
            }
        };

module.exports = Parser;


},{"../utils.js":4}],4:[function(_dereq_,module,exports){
'use strict';

function isString(str) {
    return Object.prototype.toString.call(str) === '[object String]';
}

function isFunction(fn) {
    return Object.prototype.toString.call(fn) === '[object Function]';
}

// Do the eval trick, since JSON object not present
function customParse(chunk) {
    if (!chunk || !/^[{|\[].*[}|\]]$/.test(chunk)) {
        throw new Error('parseerror');
    }
    return eval('(' + chunk + ')'); // eslint-disable-line no-eval
}

function parse(chunk, successCb, errorCb) {
    let jsonObj;
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
    parse: parse
};

},{}]},{},[1])
(1)
});