require([
    '$api/models',
    'scripts/config',
    'scripts/parse'
], function(models, config, parse, languageExample) {
    'use strict';
    parse.initialize(config.data);
});
