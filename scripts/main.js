require([
  '$api/models',
  'scripts/config',
  'scripts/app'
], function(models, config, app) {
  'use strict';
    app.initialize(config.data);
});
