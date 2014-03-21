require([
  'scripts/config',
  'scripts/firebase'
], function(config, firebase) {
  'use strict';
    firebase.initialize(config.data);
});
