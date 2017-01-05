'use strict';

function isString(str) {
    return Object.prototype.toString.call(str) === '[object String]';
}

function isFunction(fn) {
    return Object.prototype.toString.call(fn) === '[object Function]';
}

function trim(str) {
    if (!str) {
        return str;
    }
    if (str.trim) {
        return str.trim();
    }
    return str.replace(/(^\s*|\s*$)/g, '');
}

// Do the eval trick, since JSON object not present
function customParse(chunk) {
    if (!chunk || !/^[\{|\[].*[\}|\]]$/.test(chunk)) {
        throw new Error('parseerror');
    }
    return eval('(' + chunk + ')'); // eslint-disable-line no-eval
}

function parse(chunk, successCb, errorCb) {
    var jsonObj;
    try {
        jsonObj = typeof JSON !== 'undefined' ? JSON.parse(chunk) : customParse(chunk);
    } catch (ex) {
        if (isFunction(errorCb)) {
            errorCb('parsererror');
        }
        return;
    }
    // No parse error proceed to success
    if (jsonObj && isFunction(successCb)) {
        successCb(jsonObj);
    }
}

module.exports = {
    isString: isString,
    isFunction: isFunction,
    trim: trim,
    parse: parse
};
