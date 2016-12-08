/* eslint no-param-reassign:0 */
'use strict';

var xhr = require('./net/xhr'),
    utils = require('./utils.js');

function getParser(parserType) {
    switch (parserType.toLowerCase()) {
        case 'json-array':
            return require('./parsers/json-array');
        default:
            return require('./parsers/json-chunk');
    }
}

/**
 * @param {String} url A string containing the URL to which the request is sent.
 * @param {Object} url A set of key/value pairs that configure the Ajax request.
 * @return {XMLHttpRequest} The XMLHttpRequest object for this request.
 * @method ajax
 */
function ajax(url, options) {
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

    var Parser = getParser(options.parserType || 'json-chunk'), // Retrieve the Parser based on parser type
        parser = new Parser(options); // Create a new Parser instance

    // Assign onChunk to options with parse function, binded to the parser object
    options.onChunk = parser.parse.bind(parser);

    return xhr.send(url, options);
}

module.exports = {
    flow: ajax
};
