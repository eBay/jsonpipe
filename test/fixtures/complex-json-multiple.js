window['complex-json-multiple'] = [{
    "lasso": {
        "plugins": [
            "i18n/optimizer/plugin",
            "lasso-marko",
            {
                "plugin": "lasso-less",
                "config": {
                    "extensions": ["less", "css"],
                    "lessConfig": {
                        "strictMath": true
                    }
                }
            },
            {
                "plugin": "lasso-autoprefixer",
                "config": {
                    "browsers": "> 1%"
                }
            }
        ],
        "minifyInlineOnly": false,
        "bundlingEnabled": false,
        "cacheProfile": "development",
        "fileWriter": {
            "url-prefix": "/static",
            "outputDir": "static",
            "includeSlotNames": true,
            "fingerprintsEnabled": false
        }
    },
    "logging-inc": {
        "loglevel": {
            "debug": "hhhh:*,xxx:*"
        }
    },
    "cal-publishing-inc": {
        "appenders": {
            "console": {
                "enabled": true,
                "splCharKeys": {
                    "deb{ug": "hhhh:*,xxx:*",
                    "war}n": "none",
                    "tr{ansa}ction": "none",
                    "err\"or": "*",
                    "te/s\t": "test",
                    "test\\": "test"
                }
            }
        }
    },
    "services": {
        "mockServiceResponse": false,
        "appMetadataSvc": {
            "hostname": ".com"
        },
        "experienceservice": {
            "hostname": ".com"
        },
        "browseexperienceservice": {
            "hostname": ".com",
            "port": 80,
            "mockServiceResponse": false
        },
        "browseexperienceservicemoduleprovider": {
            "hostname": ".com",
            "port": 80
        },
        "browserefineexperienceservice": {
            "hostname": ".com",
            "port": 80
        },
        "browseexperienceservice_AMP": {
            "hostname": ".com",
            "port": 80
        }
    }
},
{
    "name": "jsonpipe",
    "version": "2.1.1",
    "description": "AJAX utility for consuming chunked JSON responses",
    "main": "./lib/jsonpipe.js",
    "scripts": {
        "test": "gulp test",
        "coveralls": "gulp test-cov && gulp report-coveralls && rm -rf coverage && rm -rf lib-cov"
    },
    "repository": {
        "type": "git",
        "url": "git@github.com:eBay/jsonpipe.git"
    },
    "author": "Senthil Padmanabhan <https://twitter.com/senthil_hi>",
    "license": "MIT",
    "devDependencies": {
        "gulp": "~3.8.11",
        "gulp-browserify": "~0.5.1",
        "gulp-clean": "^0.3.1",
        "gulp-coveralls": "^0.1.4",
        "gulp-istanbul": "^0.10.3",
        "gulp-istanbul-report": "0.0.1",
        "gulp-mocha-phantomjs": "^0.10.1",
        "gulp-replace": "^0.5.4",
        "mocha-lcov-reporter": "^1.0.0",
        "mocha-phantomjs-istanbul": "0.0.2"
    },
    "publishConfig": {
        "registry": "https://registry.npmjs.org/"
    }
}
];
