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
    var $loading = $('.loading');

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
     * loads the artist according to the letter which was clicked
     */
    $('.letters').click(function() {
        $col.fadeOut('fast');
        $loading.fadeIn("fast");
        var content_show = $(this).html();
        $col.load("/laudio/artist/" + content_show + "/", function (){ 
            $loading.fadeOut('fast', function(){
            $col.fadeIn('fast');
            // if the current song is played, set the bg
            var currentSongId = $('#songId').html();
            if($('#' + currentSongId).length){
                var currentSong = document.getElementById(currentSongId);
                currentSong.style.backgroundColor = "#ABC8E2";
            }
            });
        });
    });

    /**
     * loads the wohle collection into the player
     */
    $('#wholeColl').click(function() {
        $col.fadeOut('fast');
        $loading.fadeIn("fast");
        $col.load("/laudio/collection/", function (){
            $loading.fadeOut('fast', function(){
            $col.fadeIn('fast');
            // if the current song is played, set the bg
            var currentSongId = $('#songId').html();
            if($('#' + currentSongId).length){
                var currentSong = document.getElementById(currentSongId);
                currentSong.style.backgroundColor = "#ABC8E2";
            }
            });
        });
    });

    /**
     * searches if input in the search field is confirmed with enter
     */
    $('#simplesearchfield').keyup(function(e) {
        // keyCode 13 = ENTER
        if(e.which == 13){
            $col.fadeOut('fast');
            $loading.fadeIn("slow");
            var searchValue =
              encodeURIComponent($('#simplesearchfield').attr("value"));
            $col.load("/laudio/searchall/" + searchValue + "/", function() {
				$loading.fadeOut('fast');
                $col.fadeIn('slow');
                // if the current song is played, set the bg
                var currentSongId = $('#songId').html();
                if($('#' + currentSongId).length){
                    var currentSong = document.getElementById(currentSongId);
                    currentSong.style.backgroundColor = "#ABC8E2";
                }
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
        var url = "/laudio/advsearch/";
        // FIXME: maybe set this as data instead of url, wouldnt be much
        // shorter though
        var query = "?artist=" + artist + "&amp;title=" + title +
                    "&amp;genre=" + genre + "&amp;album=" + album;
        $col.load(url + query, function (){
            $loading.fadeOut('fast', function(){
                $col.fadeIn('slow');
                // if the current song is played, set the bg
                var currentSongId = $('#songId').html();
                if($('#' + currentSongId).length){
                    var currentSong = document.getElementById(currentSongId);
                    currentSong.style.backgroundColor = "#ABC8E2";
                }
            });
        });
    });

});
