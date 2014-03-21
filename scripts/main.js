require([
    'scripts/config',
    'scripts/fbase#FBase'
], function(config, fBase) {
    'use strict';
    fBase.initialize(config.data);
});
