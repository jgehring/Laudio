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
    var $audio = $("#player");
    var $col = $('#collection tbody');
    var $loading = $('.loading');
    $audio[0].addEventListener("ended", checkShuffleRepeat, true);
    $audio[0].addEventListener("playing", updatePlayPause, true);
    $audio[0].addEventListener("pause", updatePlayPause, true);
    
    /**
     * loads the artist according to the letter which was clicked
     */
    $('#characters a').click(function() {
        $col.fadeOut('fast');
        $('#characters').fadeOut("slow");
        $loading.fadeIn("fast");
        var content_show = $(this).html();
        if (content_show == "All"){
            $col.load("/laudio/collection/", function (){ 
                $loading.fadeOut('fast', function(){
                    $col.fadeIn('fast');
                    // set color to just playing song
                    var lastSong = $("body").data("playing");
                    if (lastSong !== 0){
                        $("#row" + lastSong).addClass("playing");
                    }
                });
            });            
        } else {
            $col.load("/laudio/artist/" + content_show + "/", function (){ 
                $loading.fadeOut('fast', function(){
                    $col.fadeIn('fast');
                    // set color to just playing song
                    var lastSong = $("body").data("playing");
                    if (lastSong !== 0){
                        $("#row" + lastSong).addClass("playing");
                    }
                });
            });
        }
        
    });

});

// search
function search(simple) {
    var $col = $('#collection tbody');
    var $loading = $('.loading');
    var all = $("#search input").attr("value");
    var title = $("#advSearch tr:eq(0) input").attr("value");
    var artist = $("#advSearch tr:eq(1) input").attr("value");
    var album = $("#advSearch tr:eq(2) input").attr("value");
    var genre = $("#advSearch tr:eq(3) input").attr("value");
    
    // check if advanced search contains input
    if((title || artist || album || genre) && !simple){
        $col.fadeOut('fast');
        $loading.fadeIn("slow");
        var url = "/laudio/advsearch/";
        // FIXME: maybe set this as data instead of url, wouldnt be much
        // shorter though
        var query = "?artist=" + artist + "&amp;title=" + title +
                    "&amp;genre=" + genre + "&amp;album=" + album;
        $col.load(url + query, function (){
            $loading.fadeOut('fast', function(){
                $col.fadeIn('slow');
                // set color to just playing song
                var lastSong = $("body").data("playing");
                if (lastSong !== 0){
                    $("#row" + lastSong).addClass("playing");
                }
            });
        });
           
           
    } else if (all) {
        $col.fadeOut('fast');
        $loading.fadeIn("slow");
        var searchValue = encodeURIComponent($('.search').attr("value"));
        $col.load("/laudio/searchall/" + searchValue + "/", function() {
            $loading.fadeOut('fast');
            $col.fadeIn('slow');
            // set color to just playing song
            var lastSong = $("body").data("playing");
            if (lastSong !== 0){
                $("#row" + lastSong).addClass("playing");
            }
        });
    } else {
        return false
    }
};

/**
 * Plays a Song which matches the id
 * @param id = id of the line (without row, like 143)
 *
 */
function playSong(id){
    var $audio = $("#player");
    var lastSong = $("body").data("playing");
    if(lastSong !== 0){
        $("#row" + lastSong).removeClass("playing");
    }
    
    $.getJSON("/laudio/song_data/" + id + "/", function(json){
        $("#currentSong tr:eq(0) td").html(json.title);
        //$("#currentSong tr:eq(1) td").html(json.length);
        $("#currentSong tr:eq(2) td").html(json.tracknr);
        $("#currentSong tr:eq(3) td").html(json.artist);
        $("#currentSong tr:eq(4) td").html(json.album);
        $("#currentSong tr:eq(5) td").html(json.genre);
        $("#currentSong tr:eq(6) td").html(json.codec);
        //$("#currentSong tr:eq(7) td").html(json.bitrate);
        
        if ($audio.attr("paused")){
            $audio.attr("src", "/laudio/media/audio/" + json.path);
            $audio[0].load();
            $audio[0].play();
        } else {
            $audio[0].pause();
            $audio.attr("src", "/laudio/media/audio/" + json.path);
            $audio[0].load();
            $audio[0].play();
        }
        // store the id for later use
        $("body").data("playing", id);
        $("#row" + id).addClass("playing");
    });
}

/**
 * Selects a line (sets a darker bg) when you click on it
 * @param id = id of the line (without row, like 143)
 *
 */
function selectLine(id){
    var lastSong = $("body").data("select");
    $("#row" + lastSong).removeClass("selected");
    // store the id for later use
    $("body").data("select", id);
    $("#row" + id).addClass("selected");
}

/**
 * Check if repeat is enabled and set the next song according to this
 *
 */
function checkShuffleRepeat(){
    var repeat = $("body").data("repeat");
    if (repeat === "norepeat"){
        nextSong();
    } else if (repeat === "repeat") {
        $("#player")[0].play();
    } else if (repeat === "repeatall"){
        var songId = $("body").data("playing");
        if ($("row" + songId).next().length){
            var firstId = $("#collection tbody").first().attr("id");
            firstId = firstId.replace("row", "");
            playSong(firstId);
        } else {
            nextSong();
        }
    }
}

/**
 * Function to play the next song in line
 */
function nextSong(){
    var songId = $("body").data("playing");
    var shuffle = $("body").data("shuffle");
    
    // check if the song played is in the current selected library
    if($("#row" + songId).length !== 0){
        var $currentSong = $("#row" + songId);
    } else {
        var $currentSong = $("#collection tbody tr:first");
        // we need to do this to tell next song is not the next song in 
        // the list (which would be the first tr), but the first one itself
        // is the next song
        var first = true;
    }
    if (shuffle === "shuffle"){
        // FIXME!!!
        // reduce by 1 to exclude row0 in count
        var entriesLen = $("#collection tbody tr").length - 1;
        var randNumber = Math.floor(Math.random() * entriesLen);
        // we dont want 0 to be a result so add 1
        randNumber++;
        playSong(randNumber);
    // if there is a song next, play it
    } else if($currentSong.next().length !== 0){
        if(first === true){
            var nextTrId = $currentSong.attr("id");
        } else {
            var nextTrId = $currentSong.next().attr("id");
        }
        id = nextTrId.replace("row", "");
        playSong(id);
    }
}

/**
 * Function to play the previous song
 */
function prevSong(){
    var songId = $("body").data("playing");
    var $trId = $("#row" + songId);
    // check if the song is in the current selection
    // if not, play the first song
    if($trId.length == 0){
        nextSong();
    } else {
        // check if the played song is the first in the list
        if ($trId.prev().length !== 0){
            var id = $trId.prev().attr("id");
            id = id.replace("row", "");
            playSong(id);
        } else {
            return false;
        }
    }
}


/**
 * Function to play or stop a song
 */
function updatePlayPause(){
    var $audio = $("#player");
    var $playButton = $("#playButton img");
    if ($audio.attr("paused") === true){
        $playButton.attr("src", "/laudio/media/style/img/play.png");
    } else {
        // update title information
        var title = $("#currentSong tr:eq(0) td").html();
        var artist = $("#currentSong tr:eq(3) td").html();
        document.title = title + " - " + artist;
        $playButton.attr("src", "/laudio/media/style/img/pause.png");
    }
}

/**
 * Function to play or stop a song
 */
function play(){
    var $audio = $("#player");
    if ($audio.attr("paused") == true){
        $audio[0].play();
    } else {
        $audio[0].pause();
    }
}
