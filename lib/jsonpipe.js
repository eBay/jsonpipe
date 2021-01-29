/* eslint no-param-reassign:0 */
'use strict';

const xhr = require('./net/xhr'),
    utils = require('./utils.js'),
    Parser = require('./parsers/json-chunk'),
    /**
     * @param {String} url A string containing the URL to which the request is sent.
     * @param {Object} url A set of key/value pairs that configure the Ajax request.
     * @return {XMLHttpRequest} The XMLHttpRequest object for this request.
     * @method ajax
     */
    ajax = function (url, options) {
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

        // Init the parser
        const parser = new Parser(options);

        // Assign onChunk to options with parse function, binded to the parser object
        options.onChunk = parser.parse.bind(parser);

        return xhr.send(url, options);
    };

module.exports = {
    flow: ajax
};
