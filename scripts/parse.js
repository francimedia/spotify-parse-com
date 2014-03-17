require([
    '$api/models',
    '$views/image#Image',
    '$views/list#List'
], function(models, Image, List) {
    'use strict';

    var initialize = function(config) {
        Parse.initialize(config.app_id, config.app_key);
        // app.getTracks();
        app.getPlaylist();
    };

    var app = {
        getTracks: function() {

            var Track = Parse.Object.extend("track");
            var query = new Parse.Query(Track);
            query.descending("createdAt");

            query.find({
                success: function(results) {

                    for (var i = 0; i < 1; i++) {
                        var track = results[i];
                        var track_id = models.Track.fromURI(track.get('spotify_id'));

                        models.player.playTrack(track_id);

                        var image = Image.forTrack(track_id, {
                            width: 200,
                            height: 200,
                            player: true
                        });
                        document.getElementById('albumCoverContainer').appendChild(image.node);

                    }
                },
                error: function(error) {
                    alert("Error: " + error.code + " " + error.message);
                }
            });
        },
        getPlaylist: function() {
            var playlist = models.Playlist.fromURI('spotify:user:billboard.com:playlist:6UeSakyzhiEt4NB3UAd6NQ'),
                list = List.forPlaylist(playlist);

            document.getElementById('playlist-player').appendChild(list.node);
            list.init();
        }
    };

    exports.initialize = initialize;
});
