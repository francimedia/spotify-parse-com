require([
    '$api/models',
    'scripts/spotify#Spotify'
], function(models, spotify) {
    'use strict';

    exports.FBase = (function() {
        var fbase = {
            min_votes: 3,
            device_id: 'spotify_app_dev',
            votesListenerRef: '',
            fb: '',
            initialize: function(config) {
                fbase.fb = new Firebase('https://noise-gong.firebaseio.com/');
                fbase.listenToVotes();
                spotify.initialize();
            },
            createSchema: function(callback) {
                // fbase.initNewRound(1, callback);
                fbase.insertRound(1, callback);
            },
            getCurrentRound: function(callback) {
                var roundsRef = fbase.fb.child('rounds').limit(1);
                roundsRef.once('value', function(snapshot) {
                    if (!snapshot.val()) {
                        fbase.createSchema(function() {
                            fbase.getCurrentRound(callback);
                        });
                        return;
                    }
                    if (callback) {
                        callback(snapshot);
                    }
                });
            },

            initNewRound: function(callback) {
                fbase.getCurrentRound(function(snapshot) {
                    // response is a list, just get the first row
                    var id = fbase.getFirstObject(snapshot).id;
                    id++;
                    fbase.insertRound(id, callback);
                });
            },

            insertRound: function(id, callback) {
                var roundsRef = fbase.fb.child('rounds').push();

                roundsRef.setWithPriority({
                    id: id,
                    createdAt: new Date().getTime()
                }, id);

                if (callback) {
                    callback();
                }

            },

            // curl -X POST -d '{ "device_id": "spotify_app_dev", "createdAt": "NOW()" }' https://noise-gong.firebaseio.com/votes/{id}.json

            insertVote: function(id) {
                var votesRef = fbase.fb.child('votes/' + id).push();
                votesRef.set({
                    device_id: fbase.device_id,
                    createdAt: new Date().getTime()
                });
            },

            listenToVotes: function() {

                fbase.getCurrentRound(function(snapshot) {

                    var id = fbase.getFirstObject(snapshot).id;

                    fbase.votesListenerRef = fbase.fb.child('votes/' + id);

                    // inital check
                    fbase.votesListenerRef.once('value', function(snapshot) {
                        fbase.skipToNextTrackValidation();
                    });

                    // add listener for changes/updates/new votes
                    fbase.votesListenerRef.on('child_added', function(snapshot) {
                        fbase.skipToNextTrackValidation();
                    });

                });

            },

            skipToNextTrackValidation: function() {

                fbase.votesListenerRef.once('value', function(snapshot) {

                    fbase.updateVoteIndicator(snapshot.numChildren(), fbase.min_votes);

                    if (snapshot.numChildren() < fbase.min_votes) {
                        return false;
                    }

                    // skip to next track
                    // models.player.skipToNextTrack();
                    spotify.playNext();

                    // init a new round
                    fbase.initNewRound(function() {
                        fbase.listenToVotes();
                    });

                });
            },

            // get the first object of a list of objects
            getFirstObject: function(snapshot) {
                for (var key in snapshot.val()) {
                    return snapshot.val()[key];
                }
            },
            updateVoteIndicator: function(current, total){
                $('#votes-current').text(current);
                $('#votes-total').text(total);
            }

        };
        return fbase;
    })();


});
