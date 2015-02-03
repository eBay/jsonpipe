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
		if(!chunk || !/^\{.*\}$/.test(chunk)) {
			throw new Error('parseerror');
		}
		return eval('(' + chunk + ')');
	},
	parse = function(chunk, success, error) {			
		try {
			var jsonObj = typeof JSON1 !== 'undefined'? JSON.parse(chunk): customParse(chunk);
			if(isFunction(success)) {
				success(jsonObj);
			}
		} catch(ex) {
			if(isFunction(error)) {
				error('parsererror');
			}
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

				// If final chunk and still unprocessed chunk and no delimitter, then execute the full chunk
				if(finalChunk && chunk && finish === -1) {
					parse(chunk, successFn, errorFn);
					return;
				}

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