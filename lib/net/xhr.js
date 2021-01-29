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
