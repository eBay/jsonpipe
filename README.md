# jsonpipe [![Build Status](https://travis-ci.org/eBay/jsonpipe.svg?branch=master)](https://travis-ci.org/eBay/jsonpipe) [![Coverage Status](https://coveralls.io/repos/eBay/jsonpipe/badge.svg?branch=master&service=github)](https://coveralls.io/github/eBay/jsonpipe?branch=master) [![npm version](https://badge.fury.io/js/jsonpipe.svg)](http://badge.fury.io/js/jsonpipe) [![Dependency Status](https://david-dm.org/ebay/jsonpipe.svg)](https://david-dm.org/ebay/jsonpipe)

jsonpipe is a lightweight AJAX client for chunked JSON responses. The API is similar to [jQuery ajax](http://api.jquery.com/jquery.ajax/), but for JSON responses transmitted through [chunked encoding](http://en.wikipedia.org/wiki/Chunked_transfer_encoding). It is a standalone utility with no dependencies. 

## Prerequisites
To use jsonpipe, the server should 

* Emit the [Transfer-Encoding: chunked](http://en.wikipedia.org/wiki/Chunked_transfer_encoding) HTTP header
* Every valid JSON object should be separated by the delimiter `\n\n` (double new line character, it is also  [configurable](#delimiter)). Instead of processing the JSON on every chunk, jsonpipe waits for the delimiter and then processes. The server should always ensure there is a valid JSON object between the delimiter. The reasoning behind this is, even when a chunk has an invalid JSON (which is very likely), the JSON processing would not break and wait for the next delimiter. A sample JSON response shown below 
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
* If the server wants to send a valid JSON [MIME](http://www.ietf.org/rfc/rfc4627.txt) type (`application/json`) in response header, set the [`parseType`](#parsetype) option as `json-array` and the response should be a JSON Array as shown below
```JSON
    [
        {
            "id": 12345,
            "title": "Bruce Wayne",
            "price": "$199.99"
        },
        {
            "id": 67890,
            "title": "Bane",
            "price": "$299.99"
        }
    ]
```
When using a delimiter based response, even though every chunk (before & after a delimiter) is a valid JSON object, the overall server response is not a valid JSON response. This means that the server cannot respond with the MIME type `application/json`. Some services may have concern over this. To solve this jsonpipe has a [json-array](##json-array) parse type option.

## Usage
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
        "parseType": "json-chunk", // String. Optional, the type of parsing to be used. Values can be json-chunk | json-array. Default is "json-chunk",
        "onHeaders": function(statusText, headers) {
            // Do something with the headers and the statusText.
        }
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
        "data": "", // String. A serialized string to be sent in a POST/PUT request,
        "withCredentials": true // Boolean. Send cookies when making cross-origin requests; default is true
    });
```

### options
#### delimiter
Type: `String`

The delimiter separating valid JSON objects in the chunked response; default is `\n\n`

#### parseType
Type: `String`

The type of parsing to be used. Values can be `json-chunk` or `json-array`. The default is `json-chunk`, which uses the delimiter based response. Please refer the [`json-array`](#json-array) section to see how it works. 

#### onHeaders
Type: `Function`

The callback function to be called when headers are received. The function gets passed the the `XMLHttpRequest` object's  `statusText` and the headers.

#### success
Type: `Function`

The callback function to be called on every valid JSON chunk. The function gets passed the parsed JSON object. 

#### error
Type: `Function`

The callback function to be called on error scenarios. The function gets passed with an error message, reasoning the failure. There can be many reasons for errors, the most common one being the JSON parse error. It that case the error message would be `parsererror`. For errors associated with the HTTP request the message would be `XMLHttpRequest` object's  `statusText`. 

#### complete
Type: `Function`

The callback function to be called when the request finishes (after success and error callbacks are executed). The function gets passed the `XMLHttpRequest` object's  `statusText`.

#### timeout
Type: `Number`

Timeout in milliseconds for the HTTP request. If a call exceeds the timeout, the call is aborted and error function is called.

#### method
Type: `String`

The HTTP method/type of request to make (e.g. `POST`, `DELETE`, `PUT`); default is `GET`.

#### headers
Type: `Object`

An object of additional header key/value pairs to send along with request.

#### data
Type: `String`

A serialized string to be sent in the request body for a POST/PUT request

## Testing
The entire test suite for the jsonpipe API is available in the main test file  [jsonpipe.js](https://github.com/eBay/jsonpipe/blob/master/test/jsonpipe.js). The [mocha-phantomjs](https://github.com/metaskills/mocha-phantomjs) wrapper is used as the testing framework and [chai](http://chaijs.com/api/assert/) for assertion. To run the tests - clone/fork the [repo](https://github.com/eBay/jsonpipe), 
install the package `$ npm install` and run

    $ npm test

## Issues
Have a bug or a feature request? [Please open a new issue](https://github.com/eBay/jsonpipe/issues)

##Author(s)
[Senthil Padmanabhan](http://senthilp.com/)

## License 
Copyright (c) 2015 eBay Inc.

Released under the MIT License
http://www.opensource.org/licenses/MIT
