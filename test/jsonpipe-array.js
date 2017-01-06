/* global smartRequire */

(function() {
    'use strict';
    var assert = smartRequire('chai').assert,
        sinon = smartRequire('sinon'),
        jsonpipe = smartRequire('../lib/jsonpipe'),
        testUrl = 'https://github.com/eBay/jsonpipe'; // this is a dummy URL, the actual response will be simulated by sinon

    describe('verify json-array responses', function() {
        var headers = {
            "Content-Type": "application/json",
            "Transfer-Encoding": "chunked"
        };

        describe('verify json-array success scenarios', function() {
            var fakexhr;

            before(function() {
                fakexhr = sinon.useFakeXMLHttpRequest();
            });

            after(function() {
                fakexhr.restore();
            });

            it('should process a simple JSON Array response with one object in the Array', function(done) {
                var xhr = jsonpipe.flow(testUrl, {
                    parserType: "json-array",
                    "success": function(data) {
                        assert.equal(data.id, 7);
                        done();
                    }
                });

                xhr.respond(200, headers, JSON.stringify([
                    { "id": 7 }
                ]));
            });

            it('should process a empty JSON Array', function(done) {
                var xhr = jsonpipe.flow(testUrl, {
                    parserType: "json-array",
                    "complete": function(msg) {
                        assert.equal(msg, 'OK');
                        done();
                    }
                });

                xhr.respond(200, headers, JSON.stringify([]));
            });

            it('should process a empty JSON object', function(done) {
                var xhr = jsonpipe.flow(testUrl, {
                    parserType: "json-array",
                    "success": function(msg) {
                        assert.deepEqual(msg, {});
                        done();
                    }
                });

                xhr.respond(200, headers, JSON.stringify({}));
            });

            it('should process a simple JSON Array response with two objects in the Array', function(done) {
                var chunkCount = 0,
                    xhr = jsonpipe.flow(testUrl, {
                        parserType: "json-array",
                        "success": function(data) {
                            chunkCount++;
                            assert.equal(data.id, chunkCount);
                            if (chunkCount === 2) {
                                done();
                            }
                        }
                    });

                // Set chunkSize
                xhr.chunkSize = 9;

                xhr.respond(200, headers, JSON.stringify([
                    { "id": 1 }, { "id": 2 }
                ]));
            });

            it('should process a simple JSON Array response with multiple objects in the Array', function(done) {
                var chunkCount = 0,
                    xhr = jsonpipe.flow(testUrl, {
                        parserType: "json-array",
                        "success": function(data) {
                            chunkCount++;
                            assert.equal(data.id, chunkCount);
                            if (chunkCount === 5) {
                                done();
                            }
                        }
                    });

                xhr.respond(200, headers, JSON.stringify([
                    { "id": 1 }, { "id": 2 }, { "id": 3 }, { "id": 4 }, { "id": 5 }
                ]));
            });

            it('should process a simple JSON Array response with multiple objects in the Array and small chunk size',
                function(done) {
                    var chunkCount = 0,
                        xhr = jsonpipe.flow(testUrl, {
                            parserType: "json-array",
                            "success": function(data) {
                                chunkCount++;
                                assert.equal(data.id, chunkCount);
                                if (chunkCount === 5) {
                                    done();
                                }
                            }
                        });

                    // Set chunkSize
                    xhr.chunkSize = 5;

                    xhr.respond(200, headers, JSON.stringify([
                        { "id": 1 }, { "id": 2 }, { "id": 3 }, { "id": 4 }, { "id": 5 }
                    ]));
                }
            );

            it('should process a simple JSON Array response with multiple objects in the Array and large chunk size',
                function(done) {
                    var chunkCount = 0,
                        xhr = jsonpipe.flow(testUrl, {
                            parserType: "json-array",
                            "success": function(data) {
                                chunkCount++;
                                assert.equal(data.id, chunkCount);
                                if (chunkCount === 5) {
                                    done();
                                }
                            }
                        });

                    // Set chunkSize
                    xhr.chunkSize = 100;

                    xhr.respond(200, headers, JSON.stringify([
                        { "id": 1 }, { "id": 2 }, { "id": 3 }, { "id": 4 }, { "id": 5 }
                    ]));
                }
            );

            it('should process a complex JSON Array response with single object', function(done) {
                var xhr = jsonpipe.flow(testUrl, {
                    parserType: "json-array",
                    "success": function(data) {
                        assert.equal(data.lasso.fileWriter.outputDir, 'static');
                        done();
                    }
                });

                xhr.respond(200, headers, JSON.stringify(window['complex-json-single']));
            });

            it('should process a complex JSON Array response with multiple objects', function(done) {
                var chunkCount = 0,
                    xhr = jsonpipe.flow(testUrl, {
                        parserType: "json-array",
                        "success": function(data) {
                            chunkCount++;
                            switch (chunkCount) { // eslint-disable-line default-case
                                case 1:
                                    assert.equal(data.lasso.fileWriter.outputDir, 'static');
                                    break;
                                case 2:
                                    assert.equal(data.repository.type, 'git');
                            }
                            if (chunkCount === 2) {
                                done();
                            }
                        }
                    });

                xhr.respond(200, headers, JSON.stringify(window['complex-json-multiple']));
            });

            it('should process JSON Array response with special characters ({, }, ", \, /) in keys and values', function(done) { // eslint-disable-line max-len
                var xhr = jsonpipe.flow(testUrl, {
                    parserType: "json-array",
                    "success": function(data) {
                        // Asserting the keys
                        assert.equal(data['cal-publishing-inc'].appenders.console.splCharKeys['deb{ug'], 'hhhh:*,xxx:*'); // eslint-disable-line max-len
                        assert.equal(data['cal-publishing-inc'].appenders.console.splCharKeys['war}n'], 'none');
                        assert.equal(data['cal-publishing-inc'].appenders.console.splCharKeys['tr{ansa}ction'], 'none');
                        assert.equal(data['cal-publishing-inc'].appenders.console.splCharKeys['err\"or'], '*');
                        assert.equal(data['cal-publishing-inc'].appenders.console.splCharKeys['te/s\t'], 'test');
                        assert.equal(data['cal-publishing-inc'].appenders.console.splCharKeys['test\\'], 'test');

                        // Asserting the values
                        assert.equal(data['logging-inc'].loglevel.url, 'deb{ug');
                        assert.equal(data['logging-inc'].loglevel.outputDir, 'war}n');
                        assert.equal(data['logging-inc'].loglevel.includeSlotNames, 'tr{ansa}ction');
                        assert.equal(data['logging-inc'].loglevel.fingerprintsEnabled, 'err\"or');
                        assert.equal(data['logging-inc'].loglevel.test1, 'te/s\t');
                        assert.equal(data['logging-inc'].loglevel.test2, 'test\\');
                        done();
                    }
                });

                xhr.respond(200, headers, JSON.stringify(window['complex-json-single']));
            });

            it('should NOT call the error function for an empty JSON Array',
                function(done) {
                    var isErrorFnCalled = false,
                        xhr = jsonpipe.flow(testUrl, {
                            parserType: "json-array",
                            "error": function() {
                                isErrorFnCalled = true;
                            },
                            "complete": function() {
                                assert.isFalse(isErrorFnCalled);
                                done();
                            }
                        });

                    xhr.respond(200, headers, JSON.stringify([]));
                }
            );

            it('should NOT call the error function for an empty JSON Object',
                function(done) {
                    var isErrorFnCalled = false,
                        xhr = jsonpipe.flow(testUrl, {
                            parserType: "json-array",
                            "error": function() {
                                isErrorFnCalled = true;
                            },
                            "complete": function() {
                                assert.isFalse(isErrorFnCalled);
                                done();
                            }
                        });

                    xhr.respond(200, headers, JSON.stringify({}));
                }
            );

            it('should NOT call the error function for a valid JSON Array and small chunk size',
                function(done) {
                    var isErrorFnCalled = false,
                        xhr = jsonpipe.flow(testUrl, {
                            parserType: "json-array",
                            "error": function() {
                                isErrorFnCalled = true;
                            },
                            "complete": function() {
                                assert.isFalse(isErrorFnCalled);
                                done();
                            }
                        });

                    // Set chunkSize
                    xhr.chunkSize = 5;

                    xhr.respond(200, headers, JSON.stringify([
                        { "id": 1 }, { "id": 2 }, { "id": 3 }, { "id": 4 }, { "id": 5 }
                    ]));
                }
            );

            it('should NOT call the error function for a valid JSON Array and large chunk size',
                function(done) {
                    var isErrorFnCalled = false,
                        xhr = jsonpipe.flow(testUrl, {
                            parserType: "json-array",
                            "error": function() {
                                isErrorFnCalled = true;
                            },
                            "complete": function() {
                                assert.isFalse(isErrorFnCalled);
                                done();
                            }
                        });

                    // Set chunkSize
                    xhr.chunkSize = 200;

                    xhr.respond(200, headers, JSON.stringify([
                        { "id": 1 }, { "id": 2 }, { "id": 3 }, { "id": 4 }, { "id": 5 }
                    ]));
                }
            );
        });
        // Array with trailing comma
    });
}());

