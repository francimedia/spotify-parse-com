require([
    '$api/models',
    '$views/image#Image',
    '$views/list#List'
], function(models, Image, List) {
    'use strict';

    var initialize = function(config) {
        // Parse.initialize(config.app_id, config.app_key);
        // app.getTracks();
        app.getPlaylist();
        app.nowPlaying();
        app.bind();
    };

    var spotify = this;
    spotify.player = models.player;
    spotify.playlist = models.Playlist.fromURI('spotify:user:billboard.com:playlist:6UeSakyzhiEt4NB3UAd6NQ');

    // console.log(spotify.player);
    // console.log(spotify.playlist);

    // DOM elements
    spotify.dom = {
        next: $('#next'),
        np: $('#np'),
        singlePlayer: $('#single-track-player'),
        playlistPlayer: $('#playlist-player')
    };

    var app = {
        getPlaylist: function() {
            var list = List.forPlaylist(spotify.playlist);
            spotify.dom.playlistPlayer.append(list.node);
            list.init();
        },
        nowPlaying: function() {
            var nowPlaying = spotify.dom.np;
            var npTrack, npTrackImage;

            function updateStatus(track) {
                npTrack = models.Track.fromURI(track.uri);
                npTrackImage = Image.forTrack(npTrack, {
                    player: true
                });

                if (track === null) {
                    nowPlaying.html('No track currently playing');
                } else {
                    nowPlaying.html('Now playing: ' + track.name);

                    spotify.dom.singlePlayer.empty().append(npTrackImage.node);
                }
            }
            // update on load
            spotify.player.load('track').done(function(p) {
                updateStatus(p.track);
            });

            // update on change
            spotify.player.addEventListener('change', function(p) {
                updateStatus(p.data.track);
            });
        },
        playNext: function() {
            console.log(spotify.player);
            spotify.player.shuffle = true;
            spotify.player.skipToNextTrack();
            console.log(spotify.player);
        },
        bind: function(){

            spotify.dom.next.on('click', app.playNext);
        }
    };

    exports.initialize = initialize;
});
