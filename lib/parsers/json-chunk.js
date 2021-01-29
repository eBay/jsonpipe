'use strict';

var utils = require('../utils.js');

function Parser(options) {
    this.offset = 0;
    this.token = options.delimiter || '\n\n';
    this.success = options.success;
    this.error = options.error;
}

Parser.prototype.parse = function (text, finalChunk) {
    let chunk = text.substring(this.offset),
        start = 0,
        finish = chunk.indexOf(this.token, start),
        subChunk;

    if (finish === 0) { // The delimiter is at the beginning so move the start
        start = this.token.length;
    }

    // Re-assign finish to the next token
    finish = chunk.indexOf(this.token, start);

    while (finish > -1) {
        subChunk = chunk.substring(start, finish);
        if (subChunk) {
            utils.parse(subChunk, this.success, this.error);
        }
        start = finish + this.token.length; // move the start
        finish = chunk.indexOf(this.token, start); // Re-assign finish to the next token
    }
    this.offset += start; // move the offset

    // Get the remaining chunk
    chunk = text.substring(this.offset);
    // If final chunk and still unprocessed chunk and no delimiter, then execute the full chunk
    if (finalChunk && chunk && finish === -1) {
        utils.parse(chunk, this.success, this.error);
    }
};

module.exports = Parser;

