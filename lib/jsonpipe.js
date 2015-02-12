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
	/**
     * @param {String} url A string containing the URL to which the request is sent.
     * @param {Object} url A set of key/value pairs that configure the Ajax request.
     * @return {XMLHttpRequest} The XMLHttpRequest object for this request.
     * @method ajax
     */		
	ajax = function(url, options) {		
		// Do all prerequisite checks
		if(!url) {
			return;
		}

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
		
		var offset = 0,
			token = options.delimiter || '\n\n',			
			onChunk = function(text, finalChunk) {
				var chunk = text.substring(offset),
					start = 0,
					finish = chunk.indexOf(token, start),
					successFn = options.success,
					errorFn = options.error,
					subChunk;

				if(finish === 0) { // The delimiter is at the beginning so move the start
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
				// If final chunk and still unprocessed chunk and no delimiter, then execute the full chunk
				if(finalChunk && chunk && finish === -1) {
					parse(chunk, successFn, errorFn);				
				}				
			};
		
		// Assign onChunk to options
		options.onChunk = onChunk;		

		return xhr.send(url, options);		
	};

module.exports =  {
	flow: ajax
};