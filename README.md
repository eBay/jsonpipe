#jsonpipe [![Build Status](https://travis-ci.org/eBay/jsonpipe.svg?branch=master)](https://travis-ci.org/eBay/jsonpipe)

jsonpipe is a lightweight AJAX client for chunked JSON responses. The API is similar to [jQuery ajax](http://api.jquery.com/jquery.ajax/), but for JSON reposnses trasmitted through [chunked encoding](http://en.wikipedia.org/wiki/Chunked_transfer_encoding). It is a standalone utility with no dependencies. 

##Prerequisites
To use jsonpipe, the server response should 

1. Emit the [Transfer-Encoding: chunked](http://en.wikipedia.org/wiki/Chunked_transfer_encoding) HTTP header
2. The JSON reponses should be separated by the delimiter `\n\n` - double new line characters.   

##Usage

###options

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
