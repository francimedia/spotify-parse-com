require([
    '$api/models',
    'scripts/config',
    'scripts/spotify'
], function(models, config, spotify, languageExample) {
    'use strict';
    spotify.initialize();
});
