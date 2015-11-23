'use strict';

function send(url, options) {
    if (!url || !options) {
        return;
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
        } else if (xhr.readyState === state.LOADING) {
            if (isChunked && xhr.responseText) {
                onChunk(xhr.responseText);
            }
        } else if (xhr.readyState === state.DONE) {
            // clear timeout first
            clearTimeout(timer);
            // Check for error first
            if (xhr.status !== 200) {
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
        for (var key in headers) {
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
