require([
    '$api/models',
    '$views/image#Image',
    '$views/list#List'
], function(models, Image, List) {
    'use strict';

    var min_votes = 3;
    var device_id = "spotify_app_dev";
    var votesListenerRef;

    var fb;

    var initialize = function(config) {

        fb = new Firebase("https://noise-gong.firebaseio.com/");

        app.listenToVotes();    

    };

    var app = {
        
        createSchema: function(callback) {
            app.initNewRound(1, callback); 
        }, 

        getCurrentRound: function(callback) { 
            var roundsRef = fb.child('rounds').limit(1);
            roundsRef.once('value', function(snapshot) {
                if(snapshot.val() == null) {
                    app.createSchema(function() {
                        app.getCurrentRound(callback);
                    });
                    return;
                }   
                if(callback) {
                    callback(snapshot);
                } 
            }); 
        },

        initNewRound: function(callback) {
            app.getCurrentRound(function(snapshot) {
                // response is a list, just get the first row 
                var id = app.getFirstObject(snapshot).id;
                id++;
                app.insertRound(id, callback);   
            });
        },
        
        insertRound: function(id, callback) { 
            
            var roundsRef = fb.child('rounds').push(); 
            
            roundsRef.setWithPriority({
                id: id,
                createdAt: new Date().getTime()
            }, id);  

            if(callback) {
                callback();
            }

        }, 
        
        // curl -X POST -d '{ "device_id": "spotify_app_dev", "createdAt": "NOW()" }' https://noise-gong.firebaseio.com/votes/{id}.json

        insertVote: function(id) { 
            var votesRef = fb.child('votes/'+id).push(); 
            votesRef.set({
                device_id: device_id,
                createdAt: new Date().getTime()
            });  
        },
        
        listenToVotes: function() { 

            app.getCurrentRound(function(snapshot) {

                var id = app.getFirstObject(snapshot).id;     
                
                votesListenerRef = fb.child('votes/'+id); 
                
                // inital check
                votesListenerRef.once('value', function(snapshot) {
                    app.skipToNextTrackValidation(); 
                });

                // add listener for changes/updates/new votes
                votesListenerRef.on('child_added', function(snapshot) { 
                    app.skipToNextTrackValidation(); 
                });

            });  

        },

        skipToNextTrackValidation: function() { 

            votesListenerRef.once('value', function(snapshot) {
                
                if(snapshot.numChildren() < min_votes) {
                    return false;
                }

                // skip to next track
                models.player.skipToNextTrack();

                // init a new round
                app.initNewRound(function() {
                    app.listenToVotes();    
                });  

            });
        },

        // get the first object of a list of objects
        getFirstObject: function(snapshot) {
            for (var key in snapshot.val()) {
              return snapshot.val()[key]; 
            } 
        } 

    };

    exports.initialize = initialize;
});
