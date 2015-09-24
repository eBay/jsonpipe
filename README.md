#jsonpipe [![Build Status](https://travis-ci.org/eBay/jsonpipe.svg?branch=master)](https://travis-ci.org/eBay/jsonpipe)
[![Dependency Status](https://david-dm.org/ebay/jsonpipe.svg)](https://david-dm.org/ebay/jsonpipe)  [![devDependency Status](https://david-dm.org/ebay/jsonpipe/dev-status.svg)](https://david-dm.org/ebay/jsonpipe#info=devDependencies)

jsonpipe is a lightweight AJAX client for chunked JSON responses. The API is similar to [jQuery ajax](http://api.jquery.com/jquery.ajax/), but for JSON responses transmitted through [chunked encoding](http://en.wikipedia.org/wiki/Chunked_transfer_encoding). It is a standalone utility with no dependencies. 

##Prerequisites
To use jsonpipe, the server should 

1. Emit the [Transfer-Encoding: chunked](http://en.wikipedia.org/wiki/Chunked_transfer_encoding) HTTP header
2. Every valid JSON object should be separated by the delimiter `\n\n` (double new line character, it is also  [configurable](https://github.com/eBay/jsonpipe#delimiter)). Instead of processing the JSON on every chunk, jsonpipe waits for the delimiter and then processes. The server should always ensure there is a valid JSON object between the delimiter. The reasoning behind this is, even when a chunk has an invalid JSON (which is very likely), the JSON processing would not break and wait for the next delimiter. A sample JSON response shown below 
```JSON
    {
        "id": 12345,
        "title": "Bruce Wayne",
        "price": "$199.99"
    }
    \n\n
    {
        "id": 67890,
        "title": "Bane",
        "price": "$299.99"
    }
```

##Usage
[jsonpipe.js](https://github.com/eBay/jsonpipe/blob/master/jsonpipe.js) is bundled as a [browserify CommonJS](http://dontkry.com/posts/code/browserify-and-the-universal-module-definition.html) module, so it can be used in the same node.js `require` style. It has only one API named `flow` exposed 
```HTML
    <script src="jsonpipe.js"></script>
```
```JavaScript
    var jsonpipe = require('jsonpipe');
	/**
     * @param {String} url A string containing the URL to which the request is sent.
     * @param {Object} url A set of key/value pairs that configure the Ajax request.
     * @return {XMLHttpRequest} The XMLHttpRequest object for this request.
     * @method flow
     */
    jsonpipe.flow('http://api.com/items?q=batman', {
    	"delimiter": "", // String. The delimiter separating valid JSON objects; default is "\n\n"
        "success": function(data) {
            // Do something with this JSON chunk
        },
        "error": function(errorMsg) {
            // Something wrong happened, check the error message
        },
        "complete": function(statusText) {
            // Called after success/error, with the XHR status text
        },
        "timeout": 3000, // Number. Set a timeout (in milliseconds) for the request
        "method": "GET", // String. The type of request to make (e.g. "POST", "GET", "PUT"); default is "GET"
        "headers": { // Object. An object of additional header key/value pairs to send along with request
            "X-Requested-With": "XMLHttpRequest"
        },
        "data": "" // String. A serialized string to be sent in a POST/PUT request
    });
```

###options
####delimiter
Type: `String`

The delimiter separating valid JSON objects in the chunked response; default is `\n\n`

####success
Type: `Function`

The callback function to be called on every valid JSON chunk. The function gets passed the parsed JSON object. 

####error
Type: `Function`

The callback function to be called on error scenarios. The function gets passed with an error message, reasoning the failure. There can be many reasons for errors, the most common one being the JSON parse error. It that case the error message would be `parsererror`. For errors associated with the HTTP request the message would be `XMLHttpRequest` object's  `statusText`. 

####complete
Type: `Function`

The callback function to be called when the request finishes (after success and error callbacks are executed). The function gets passed the `XMLHttpRequest` object's  `statusText`.

####timeout
Type: `Number`

Timeout in milliseconds for the HTTP request. If a call exceeds the timeout, the call is aborted and error function is called.

####method
Type: `String`

The HTTP method/type of request to make (e.g. `POST`, `DELETE`, `PUT`); default is `GET`.

####headers
Type: `Object`

An object of additional header key/value pairs to send along with request.

####data
Type: `String`

A serialized string to be sent in the request body for a POST/PUT request

##Testing
The entire test suite for the jsonpipe API is available in the main test file  [jsonpipe.js](https://github.com/eBay/jsonpipe/blob/master/test/jsonpipe.js). The [mocha-phantomjs](https://github.com/metaskills/mocha-phantomjs) wrapper is used as the testing framework and [chai](http://chaijs.com/api/assert/) for assertion. To run the tests - clone/fork the [repo](https://github.com/eBay/jsonpipe), 
install the package `$ npm install` and run

    $ npm test

##Issues
Have a bug or a feature request? [Please open a new issue](https://github.com/eBay/jsonpipe/issues)

##Author(s)
[Senthil Padmanabhan](http://senthilp.com/)

##License 
Copyright (c) 2015 eBay Inc.

Released under the MIT License
http://www.opensource.org/licenses/MIT
