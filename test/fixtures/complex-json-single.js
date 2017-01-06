window['complex-json-single'] = [{
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
            "url": "deb{ug",
            "outputDir": "war}n",
            "includeSlotNames": "tr{ansa}ction",
            "fingerprintsEnabled": "err\"or",
            "test1": "te/s\t",
            "test2": "test\\"
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
}];
