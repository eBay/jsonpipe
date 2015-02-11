!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.jsonpipe=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var xhr = require('./net/xhr'),
	isString = function(str) {
		return Object.prototype.toString.call(str) === '[object String]';
	},
	isFunction = function(fn) {
		return Object.prototype.toString.call(fn) === '[object Function]';
	},
	// Do the eval trick, since JSON object not present
	customParse = function(chunk) {
		if(!chunk || !/^[\{|\[].*[\}|\]]$/.test(chunk)) {
			throw new Error('parseerror');
		}
		return eval('(' + chunk + ')');
	},
	parse = function(chunk, success, error) {
		var jsonObj;			
		try {
			jsonObj = typeof JSON !== 'undefined'? JSON.parse(chunk): customParse(chunk);
		} catch(ex) {
			if(isFunction(error)) {
				error('parsererror');
			}
			return;
		}	
		// No parse error proceed to success
		if(jsonObj && isFunction(success)) {
			success(jsonObj);
		}		
	},
	ajax = function(url, options) {		
		if(!url) {
			return;
		}
		
		var offset = 0,
			token = '\n\n',			
			onChunk = function(text, finalChunk) {
				var chunk = text.substring(offset),
					start = 0,
					finish = chunk.indexOf(token, start),
					successFn = options.success,
					errorFn = options.error,
					subChunk;

				if(finish === 0) { // The delimitter is at the beginning so move the start
					start = finish + token.length;
				}

				while((finish = chunk.indexOf(token, start)) > -1){
					subChunk = chunk.substring(start, finish);
					if(subChunk) {
						parse(subChunk, successFn, errorFn);
					}
					start = finish + token.length; // move the start
				}				
				offset = offset + start; // move the offset

				// Get the remaning chunk
				chunk = text.substring(offset);
				// If final chunk and still unprocessed chunk and no delimitter, then execute the full chunk
				if(finalChunk && chunk && finish === -1) {
					parse(chunk, successFn, errorFn);				
				}				
			};
		
		// Set arguments if first argument is not string
		if(!isString(url)) {
			options = url;
			url = options.url;
		}
		
		// Check if all mandatory attributes are present
		if(!url || 
			!options || 
			!(options.success || options.error || options.complete)) {
			return;
		}
		options.onChunk = onChunk;		

		return xhr.send(url, options);		
	};

module.exports =  {
	flow: ajax
};
},{"./net/xhr":2}],2:[function(require,module,exports){
'use strict';

function send(url, options) {
	if(!url || !options) {
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
		noop = function(){},
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
		if(xhr.readyState === state.HEADERS_RECEIVED) {
			encoding = xhr.getResponseHeader('Transfer-Encoding') || '';
			isChunked = encoding.toLowerCase().indexOf('chunked') > -1;
			if(!isChunked) {
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
		} else if(xhr.readyState === state.LOADING) {
			if(isChunked && xhr.responseText) {
				onChunk(xhr.responseText);
			}			
		} else if(xhr.readyState === state.DONE) {
			// clear timeout first
			clearTimeout(timer);
			// Check for error first
			if(xhr.status !== 200) {
				errorFn(xhr.statusText);
			} else {
				onChunk(xhr.responseText, true);
			} 
			// Call complete at the end
			completeFn(xhr.statusText);
		}
	};

	// Add headers
	if(headers) {
		for(var key in headers) {
			xhr.setRequestHeader(key, headers[key]);
			if(key.toLowerCase() === 'content-type') {
				addContentHeader = false;
			}
		}
	}
	if(addContentHeader) {
		xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	}
	
	// Add timeout
	if(options.timeout) {
		timer = setTimeout(function() {
			xhr.abort();
			clearTimeout(timer);
		}, options.timeout);
	}

	// Set credentials to true
	xhr.withCredentials = true;

	xhr.send(options.data);

	return xhr;
}

module.exports = {
	send: send
};
},{}]},{},[1])(1)
});