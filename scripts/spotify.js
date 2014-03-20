require([
    '$api/models',
    '$views/image#Image',
    '$views/list#List'
], function(models, Image, List) {
    'use strict';

    var Spotify = (function() {
        var spotify = {
            player: models.player,
            playlist: models.Playlist.fromURI('spotify:user:billboard.com:playlist:6UeSakyzhiEt4NB3UAd6NQ'),
            dom: {
                next: $('#next'),
                np: $('#np'),
                singlePlayer: $('#single-track-player'),
                playlistPlayer: $('#playlist-player')
            },
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

                return this;
            },
            playNext: function() {
                spotify.player.skipToNextTrack();
                return this;
            },
            init: function() {
                spotify.dom.next.on('click', spotify.playNext);
                spotify.getPlaylist();
                spotify.nowPlaying();
            }
        };

        return spotify;
    })();


    exports.Spotify = Spotify;
});
