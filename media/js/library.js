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
    $audio[0].addEventListener("ended", nextSong, true);
    $audio[0].addEventListener("playing", updatePlayPause, true);
    $audio[0].addEventListener("pause", updatePlayPause, true);
    $audio[0].addEventListener("timeupdate", updateProgressBar, true);
    $audio[0].addEventListener("volumechange", updateVolume, true);
    $audio[0].addEventListener("canplay", playWhenLoaded, false);
    updateVolume();
    
    
    /**
     * click on the progressbar to change the part
     */
    $("#progressbar canvas").click(function(e){
        var width = e.layerX - $(this).attr("offsetLeft");
        var duration = $audio.attr("duration");
        var position = Math.floor( (duration / 300) * width );
        $("#player").attr("currentTime", position);   
    });
    
    
    /**
     * If the mouse is released anywhere on the site, set clicking to false
     */
    $("#site").mouseup(function(){
        clicking = false;
    });    
    
    
    /**
     * click on the volume to change it
     */
    $("#volume canvas").mousedown(function(e){
        var width = e.layerX - $(this).attr("offsetLeft");
        var ctx = $(this)[0].getContext("2d");
        ctx.clearRect(0,0, 80 ,24);
        ctx.fillStyle = "#333";
        ctx.fillRect(0,0, width ,24);
        var vol = width / 80;
        $("#player").attr("volume", vol); 
        clicking = true;
        $(this).mousemove(function(e){
            if(clicking === false) return;
            var width = e.layerX - $(this).attr("offsetLeft");
            var ctx = $(this)[0].getContext("2d");
            ctx.clearRect(0,0, 80 ,24);
            ctx.fillStyle = "#333";
            ctx.fillRect(0,0, width ,24);
            var vol = width / 80;
            $("#player").attr("volume", vol);  
        });
    })
    
    
    /**
     * loads the artist according to the letter which was clicked
     */
    $('#characters a').click(function() {
        $("#contentHeader th a").removeClass("sortup");
        $("#contentHeader th a").removeClass("sortdown");
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
                    // update table sorting
                    $("#collection").trigger("update");
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
                    // update table sorting
                    $("#collection").trigger("update");
                });
            });
        }
        
    });

});


/*
 * Does and advanced or simple search
 * @param boolean simple:   if true, just look up the value from the 
 *                          simple searchfield, else check the 4 advanced
 *                          ones
 * 
 */
function search(simple) {
    $("#contentHeader th a").removeClass("sortup");
    $("#contentHeader th a").removeClass("sortdown");
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
                // update table sorting
                    $("#collection").trigger("update");
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
            // update table sorting
            $("#collection").trigger("update");
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
    
    // get song data
    $.getJSON("/laudio/song_data/" + id + "/", function(json){
        // store duration, then get mins and secs
        $("body").data("duration", json.duration);
        mins = Math.floor(json.duration / 60);
        secs = json.duration % 60;
        if(secs < 10){
            secs = "0" + secs;
        }
        $("#currentSong tr:eq(0) td").html(json.title);
        $("#currentSong tr:eq(1) td").html(mins + ":" + secs);
        $("#currentSong tr:eq(2) td").html(json.tracknr);
        $("#currentSong tr:eq(3) td").html(json.artist);
        $("#currentSong tr:eq(4) td").html(json.album);
        $("#currentSong tr:eq(5) td").html(json.date);
        $("#currentSong tr:eq(6) td").html(json.genre);
        $("#currentSong tr:eq(7) td").html(json.codec);
        $("#currentSong tr:eq(8) td").html(json.bitrate +  " kb/s");
        
        if ($audio.attr("paused")){
            $audio.attr("src", "/laudio/media/audio/" + json.path);
            $audio[0].load();
        } else {
            $audio[0].pause();
            $audio.attr("src", "/laudio/media/audio/" + json.path);
            $audio[0].load();
            // note: we direct playing to playWhenLoaded, which starts
            // playing when the song is being loaded
        }
        // store the id for later use
        $("body").data("playing", id);
        $("#row" + id).addClass("playing");
        // get album data
        $.getJSON("/laudio/cover/" + id + "/", function(json){
            $("#cover img").attr("src", json.coverpath);
            $("#cover img").attr("title", json.album);
            $("#cover img").attr("alt", json.album);
        });
    });
    
}


/**
 * If the song is loaded play it
 */
function playWhenLoaded(){
    // prevent it from playing the first loaded song when you initially
    // load the site
    if($("body").data("playing") !== 0){
        var $audio = $("#player");
        $audio[0].play();
    }
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
 * Function to play the next song in line, checks for repeat and shuffle
 * activated
 */
function nextSong(){
    var songId = $("body").data("playing");
    var shuffle = $("body").data("shuffle");
    var repeat = $("body").data("repeat"); 
    
    // check if the song played is in the current selected library
    if($("#row" + songId).length !== 0){
        var $currentSong = $("#row" + songId);
    } else {
        var $currentSong = $("#collection tbody tr:first");
        /* We need to do this to tell next song is not the next song in 
         * the list (which would be the first tr), but the first one itself
         * is the next song
         */
        var first = true;
    }
    
    // First we got to check for repeat
    if (repeat === "repeat"){
        /* We suppose that the song is already played and loaded correctly
         * so we immediately telling it to play again from the beginning
         */
        $("#player")[0].play();
        return;
    } else if(repeat === "repeatall"){
        /* If the next song on the list isnt there, we start playing
         * the first song in the list
         */
        if ($("#row" + songId).next().length === 0){
            var firstId = $("#collection tbody tr").first().attr("id");
            firstId = firstId.replace("row", "");
            playSong(firstId);
            return;
        }
    }
    
    // then check for shuffle
    if (shuffle === "shuffle"){
        var entriesLen = $("#collection tbody tr").length;
        var randNumber = Math.floor(Math.random() * entriesLen);
        randId = $("#collection tbody tr:eq(" + randNumber + ")").attr("id");
        randId = randId.replace("row", "");
        playSong(randId);

    /* If no repeat and shuffle were enabled, just play the next song
     */
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
        $playButton.attr("title", "play");
        $playButton.attr("alt", "play");
    } else {
        // update title information
        var title = $("#currentSong tr:eq(0) td").html();
        var artist = $("#currentSong tr:eq(3) td").html();
        document.title = title + " - " + artist;
        $playButton.attr("src", "/laudio/media/style/img/pause.png");
        $playButton.attr("title", "pause");
        $playButton.attr("alt", "pause");
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

/**
 * set repeat
 */
function setRepeat(){
    var repeat = $("body").data("repeat");
    var $repeatButton = $("#repeatButton img")
    if(repeat === "norepeat"){
        $("body").data("repeat", "repeat");
        $repeatButton.attr("src", "/laudio/media/style/img/repeat.png");
        $repeatButton.attr("title", "repeat");
        $repeatButton.attr("alt", "repeat");
    } else if (repeat === "repeat"){
        $("body").data("repeat", "repeatall");
        $repeatButton.attr("src", "/laudio/media/style/img/repeatall.png");
        $repeatButton.attr("title", "repeatall");
        $repeatButton.attr("alt", "repeatall");
    } else {
        $("body").data("repeat", "norepeat");
        $repeatButton.attr("src", "/laudio/media/style/img/repeatoff.png");
        $repeatButton.attr("title", "repeatoff");
        $repeatButton.attr("alt", "repeatoff");
    }
}


/**
 * set shuffle
 */
function setShuffle(){
    var shuffle = $("body").data("shuffle");
    var $shuffleButton = $("#shuffleButton img")
    if(shuffle === "noshuffle"){
        $("body").data("shuffle", "shuffle");
        $shuffleButton.attr("src", "/laudio/media/style/img/shuffle.png");
        $shuffleButton.attr("title", "shuffle");
        $shuffleButton.attr("alt", "shuffle");
    } else {
        $("body").data("shuffle", "noshuffle");
        $shuffleButton.attr("src", "/laudio/media/style/img/shuffleoff.png");
        $shuffleButton.attr("title", "shuffleoff");
        $shuffleButton.attr("alt", "shuffleoff");
    }
}

/**
 * Updates the filling of the progressbar
 */
function updateProgressBar(){
    // get audio data
    var $audio = $("#player");
    var duration = $audio.attr("duration");
    var currTime = $audio.attr("currentTime");
    // prevent duration from being Nan
    if(isNaN(duration)){
        duration = $("body").data("duration");
    }
    width = Math.floor((300 / duration) * currTime);    
    var $canvas = $("#progressbar canvas");
    var ctx = $canvas[0].getContext("2d");
    ctx.clearRect(0,0, 300 ,24);
    ctx.fillStyle = "#333";
    ctx.fillRect(0,0, width ,24);
    $("#progressbar").attr("title", Math.floor(currTime) + "/" + Math.floor(duration));    
}

/**
 * Updates the volume bar according to the volume set
 */
function updateVolume(){
    var $canvas = $("#volume canvas");
    var $audio = $("#player");
    var ctx = $canvas[0].getContext("2d");
    var volume = $audio.attr("volume");
    if (volume === 0){
        $("#mute img").attr("src", "/laudio/media/style/img/muted.png");
    } else {
        $("#mute img").attr("src", "/laudio/media/style/img/volume.png");
    }
    pos = Math.floor(volume * 80);
    ctx.clearRect(0,0, 80 ,24);
    ctx.fillStyle = "#333";
    ctx.fillRect(0,0, pos ,24);
}


/**
 * Mute or unmute the player
 */
function mute(){
    var $audio = $("#player");
    var volume = $audio.attr("volume");
    if(volume === 0){
        $audio.attr("volume", $("body").data("volume"));
    } else {
        $("body").data("volume", volume);
        $audio.attr("volume", "0");
    }
    updateVolume;
}


/**
 * Jump to the currently playing song in the list
 */
function jumpTo(){
    var songId = $("body").data("playing");
    document.location.hash = "row" + songId;
}
