/*global describe, it, before*/
'use strict';

// A require to work on node or browser
function smartRequire(name, windowName) {
	var stripName = function(name) {
		if(!name) {
			return;
		}
		var strippedName = name.match(/\/([^\/]+)$/);
		return strippedName? strippedName[1]: name;
	};
	if(typeof require === 'function') {
		return require(name);
	} else {
		return window[windowName || stripName(name)];
	}
}

var assert = smartRequire('chai').assert,
	sinon = smartRequire('sinon'),
	jsonpipe = smartRequire('../lib/jsonpipe'),
	testUrl = 'https://github.com/eBay/jsonpipe'; // this is a dummy URL, the actual response will be simulated by sinon

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe('jsonpipe', function() {
	it('should check if jsonpipe API is present', function() {
		assert.isNotNull(jsonpipe, 'jsonpipe should not be null');
	});

	describe('verify the iterface', function() {

		before(function () {
    		sinon.useFakeXMLHttpRequest();
		});

		it('should return undefined when called with no arguments', function() {
			assert.isUndefined(jsonpipe.flow());
		});

		it('should return undefined when called with a string url with no options', function() {
			assert.isUndefined(jsonpipe.flow(testUrl));
		});		

		it('should return undefined when called with options object with no attributes', function() {
			assert.isUndefined(jsonpipe.flow({}));
		});				

		it('should return undefined when called with options object with only url attribute', function() {
			assert.isUndefined(jsonpipe.flow({
				"url": testUrl
			}));
		});						

		it('should return XMLHttpRequest object when called with url and success attributes', function() {
			var xhr = jsonpipe.flow(testUrl, {
				"success": function() {					
				}
			});
			assert.isObject(xhr);
		});						
	});

});

