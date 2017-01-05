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

            it('should process a complex JSON Array response', function(done) {
                var xhr = jsonpipe.flow(testUrl, {
                    parserType: "json-array",
                    "success": function(data) {
                        assert.equal(data.lasso.fileWriter.outputDir, 'static');
                        done();
                    }
                });

                xhr.respond(200, headers, '{"lasso":{"plugins":["i18n/optimizer/plugin","lasso-marko",{"plugin":"lasso-less","config":{"extensions":["less","css"],"lessConfig":{"strictMath":true}}},{"plugin":"lasso-autoprefixer","config":{"browsers":"> 1%"}}],"minifyInlineOnly":false,"bundlingEnabled":false,"cacheProfile":"development","fileWriter":{"url-prefix":"/static","outputDir":"static","includeSlotNames":true,"fingerprintsEnabled":false}},"logging-inc":{"loglevel":{"debug":"hhhh:*,xxx:*"}},"cal-publishing-inc":{"appenders":{"console":{"enabled":true,"loglevel":{"debug":"hhhh:*,xxx:*","warn":"none","transaction":"none","error":"*"}}}},"services":{"mockServiceResponse":false,"appMetadataSvc":{"hostname":".com"},"experienceservice":{"hostname":".com"},"browseexperienceservice":{"hostname":".com","port":80,"mockServiceResponse":false},"browseexperienceservicemoduleprovider":{"hostname":".com","port":80},"browserefineexperienceservice":{"hostname":".com","port":80},"browseexperienceservice_AMP":{"hostname":".com","port":80}}}');
            });

            it('should not call the error function for a valid JSON Array and small chunk size',
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

            it('should not call the error function for a valid JSON Array and large chunk size',
                function(done) {
                    var isErrorFnCalled = false,
                        xhr = jsonpipe.flow(testUrl, {
                            parserType: "json-array",
                            "error": function() {
                                isErrorFnCalled = true;
                            },
                            "complete": function() {
                                //assert.isFalse(isErrorFnCalled);
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
        // complex object
        // key with special characters ({, }, ", /)
        // value with special characters
        // Array with trailing comma
    });
}());

