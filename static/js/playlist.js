/**
 * Laudio - A webbased musicplayer
 *
 * Copyright (C) 2010 Bernhard Posselt, bernhard.posselt@gmx.at
 *
 * Laudio is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 *
 * Laudio is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
 *
 */

$(function(){
    $audio = $("#player")[0];
    $audio.addEventListener("ended", checkShuffleRepeat, true);
    $audio.addEventListener("playing", updatePlayPause, true);
    $audio.addEventListener("pause", updatePlayPause, true);
    // often used ids and classes
    var $col = $('#collection');
    var $playlist = $('#playlist');
    var $loading = $('.loading');
    var $playlists = $('#playlists');
    var $audio = $('audio');

    /**
     * shows the artist list
     */
    $('#showArtists').click(function(){
        $('#artistList').slideToggle();
    });

    /**
     * shows the advanced search
     */
    $('#showSearch').click(function(){
        $('#searchForm').slideToggle();
    });

    /**
     * toggles collection
     */
    $('#toggleCollection').click(function() {
        $col.slideToggle();
    });

    /**
     * toggles playlist
     */
    $('#togglePlaylist').click(function() {
        $playlist.slideToggle();
    });

    /**
     * loads the artist according to the letter which was clicked
     */
    $('.letters').click(function() {
        $col.fadeOut('fast');
        $loading.fadeIn("slow");
        var content_show = $(this).html();
        $col.load("/laudio/playlist/artist/" + content_show + "/", function(){
            $loading.fadeOut('fast');
            $col.fadeIn('slow');
        });
    });

    /**
     * loads the wohle collection into the player
     */
    $('#wholeColl').click(function() {
        $col.fadeOut('fast');
        $loading.fadeIn("slow");
        $col.load("/laudio/playlist/collection/", function(){
            $loading.fadeOut('fast');
            $col.fadeIn('slow');
        });
    });

    /**
     * searches if input in the search field is confirmed with enter
     */
    $('#simplesearchfield').keyup(function(e) {
        // keyCode 13 = ENTER
        if(e.which == 13) {
            $col.fadeOut('fast');
            $loading.fadeIn("slow");
            var searchValue =  escape($('#simplesearchfield').attr("value"));
            $col.load("/laudio/playlist/searchall/" + searchValue + "/", function(){
                $loading.fadeOut('fast');
                $col.fadeIn('slow');
            });
        }
    });

    /**
     * loads the elements of the advanced
     */
    $('#advSearchSubmit').click(function() {
        $col.fadeOut('fast');
        $loading.fadeIn("slow");
        var title = $('#advSearchTitle').attr("value");
        var artist = $('#advSearchArtist').attr("value");
        var album = $('#advSearchAlbum').attr("value");
        var genre = $('#advSearchGenre').attr("value");
        var url = "/laudio/playlist/advsearch/";
        // FIXME: maybe set this as data instead of url, wouldnt be much
        // shorter though
        var query = "?artist=" + artist + "&amp;title=" + title + "&amp;genre=" + genre + "&amp;album=" + album;
        $col.load(url + query, function(){
            $loading.fadeOut('fast');
            $col.fadeIn('slow');
        });
    });

    /**
     * saves the current playlist
     * TODO: improve responses, e.g. that playlist are overwritten etc.
     */
    $('#savePlaylist').click(function(){
        var playlistName = window.prompt("Pick a name for the playlist", "playlist1");
        if(playlistName && playlistName !== null){
            var linkList = new Array();
            // TODO: maybe this can be done better with jquery dom than raw
            // dom lookups with children
            var rows = document.getElementById('playlist').children[0].children;
            if(rows.length != 1){
                for (var i=1; i<rows.length; i++){
                    var songLink = rows[i].title;
                    linkList.push(songLink);
                }
                var query = linkList.join(".");
                var url = "/laudio/playlist/save/";
                $.get(url, { playlistname: escape(playlistName), urls: query} );
                $playlists.load("/laudio/playlist/list/", function(){
                    $playlists.fadeOut('fast');
                });
            }
        }
    });

    /**
     * Loads a playlist into the playlist area
     */
    $('#openPlaylist').click(function(){
        var url = "/laudio/playlist/list/";
        $playlists.load(url, function(){
            $playlists.slideToggle();
            $('#playlists ul li a').click(function(){
                $("#songId").html("row0");
                var playlistName = $(this).html();
                $inner = $('#playlist tbody');
                $inner.fadeOut('fast');
                url = "/laudio/playlist/open/" + escape(playlistName) + "/";
                $inner.load(url,function(){
                    $inner.fadeIn('slow');
                });
                $playlists.slideToggle();
            });
        });
    });

    /**
     * Deletes a playlist
     */
    $('#deletePlaylist').click(function(){
        var url = "/laudio/playlist/list/";
        $playlists.load(url, function(){
            $playlists.slideToggle();
            $('#playlists ul li a').click(function(){
                var playlistName = $(this).html();
                var url = "/laudio/playlist/delete/" + escape(playlistName) + "/";
                $.get(url);
                $playlists.load("/laudio/playlist/list/", function(){
                    $playlists.slideToggle();
                });
            });
        });
    });

    /**
    * Renames a playlist
    */
    $('#renamePlaylist').click(function(){
        var url = "/laudio/playlist/list/";
        $playlists.load(url, function(){
            $playlists.slideToggle();
            $('#playlists ul li a').click(function(){
                var playlistName = $(this).html();
                var newPlaylistName = window.prompt("Enter the new Name for"
                                              + " the playlist", playlistName);
                var url = "/laudio/playlist/rename/" +
                            escape(playlistName) + "/" +
                            escape(newPlaylistName) + "/";
                $.get(url);
                $playlists.load("/laudio/playlist/list/", function(){
                        $playlists.slideToggle();
                });
            });
        });
    });

});
