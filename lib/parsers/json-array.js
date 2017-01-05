'use strict';

var utils = require('../utils.js');

function isDoubleQuoteEscaped(text) {
    var currentIndex = text.length - 1, // Start from the back of the string
        backslashCount = 0;

    // If last character is double quote then move back
    if (text[currentIndex] === '"') {
        currentIndex--;
    }

    while (currentIndex > 0) {
        // if not backslash break it
        if (text[currentIndex] !== '\\') {
            break;
        }
        backslashCount++;
        currentIndex--;
    }
    // If odd number of backslashes then the double quote is escaped
    return backslashCount % 2;
}

// Get the first unescaped end double quote index
function getStringEndIndex(text) {
    if (!text) {
        return 0;
    }

    var currentIndex = 0;

    // if text starts with a double quote, then skip to next postion
    if (text[currentIndex] === '"') {
        currentIndex++;
    }

    while (currentIndex < text.length) {
        // Check for closing double quote and check if it is not escaped
        if (text[currentIndex] === '"' && !isDoubleQuoteEscaped(text.substring(0, currentIndex))) {
            break;
        }
        currentIndex++;
    }
    return currentIndex;
}

function Parser(options) {
    this.offset = 0;
    this.success = options.success;
    this.error = options.error;
}

Parser.prototype.parse = function(text, finalChunk) {
    var chunk = text.substring(this.offset),
        curlyBraceCount = 0,
        startIndex = -1,
        finalRemainingChunk;

    for (var currentIndex = 0; currentIndex < chunk.length; currentIndex++) {
        if (chunk[currentIndex] === '{') {
            // if curlyBraceCount is zero, then the object is just getting started
            if (curlyBraceCount === 0) {
                startIndex = currentIndex;
            }
            curlyBraceCount++;
        }

        if (chunk[currentIndex] === '}') {
            curlyBraceCount--;
        }

        // If string we need do special treatment to check for curly braces inside a string
        // So just move to the end of the string
        if (chunk[currentIndex] === '"') {
            currentIndex = currentIndex + getStringEndIndex(chunk.substring(currentIndex));
        }

        if (curlyBraceCount === 0 && startIndex > -1) {
            utils.parse(chunk.substring(startIndex, currentIndex + 1), this.success, this.error);

            // Reset the offset to the next pointer of currentIndex
            this.offset = this.offset + currentIndex + 1;

            // Rest startIndex
            startIndex = -1;
        }
    }

    // if finalChunk, check the remaining chunk for incomplete or invalid JSON
    if (finalChunk) {
        finalRemainingChunk = text.substring(this.offset); // Get the final remaining chunk

        // Perform 2 checks
        // 1. Check if the curlyBraceCount is not zero, which mean incomplete JSON
        // OR
        // 2. Check if finalRemainingChunk is not closing square bracket, which means invalid JSON
        if (curlyBraceCount !== 0 ||
            utils.trim(finalRemainingChunk) !== ']') {
            utils.parse(finalRemainingChunk, this.success, this.error);
        }
    }
};

module.exports = Parser;

