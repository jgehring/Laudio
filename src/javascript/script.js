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


$(document).ready(function() { 

/***********************************************************************
 * DEFAULTS AND VARS                                                   *
 ***********************************************************************
 */
{% if library or playlist %}
    
    $("body").data("playing", 0);
    $("body").data("select", 1);
    $("body").data("volume", 1);
    $("body").data("repeat", "norepeat");
    $("body").data("shuffle", "noshuffle");

    // update volume
    updateVolume();
    
    // default Eventlisteners
    $("#player")[0].addEventListener("ended", nextSong, true);
    $("#player")[0].addEventListener("playing", updatePlayPause, true);
    $("#player")[0].addEventListener("pause", updatePlayPause, true);
    $("#player")[0].addEventListener("timeupdate", updateProgressBar, true);
    $("#player")[0].addEventListener("volumechange", updateVolume, true);
    $("#player")[0].addEventListener("canplay", playWhenLoaded, false);

{% endif %}
/***********************************************************************
 * TABLE SORTING                                                       *
 ***********************************************************************
 */
{% if library or playlist %}

    $(".collNr a").live("click", function() {
        if($("#collection tbody tr").length){
            $("#collection").tablesorter();
            if($(this).attr("class") == "sortup"){
                var sorting = [[0,0],[2,0], [3,0], [4,0]];
                // FIXME: maybe we can reduce code by getting the next 4 lines
                // into some kind of function
                $("#contentHeader th a").removeClass("sortup");
                $("#contentHeader th a").removeClass("sortdown");
                $(this).removeClass("sortup");
                $(this).addClass("sortdown");
            } else {
                var sorting = [[0,1],[2,0], [3,0], [4,0]];
                $("#contentHeader th a").removeClass("sortup");
                $("#contentHeader th a").removeClass("sortdown"); 
                $(this).removeClass("sortdown");
                $(this).addClass("sortup");
            }
            $("#collection").trigger("sorton",[sorting]);
            updateLineColors(); 
        }
    return false; 
    });
    $(".collTitle a").live("click", function() {
        if($("#collection tbody tr").length){
            $("#collection").tablesorter();
            if($(this).attr("class") == "sortup"){
                var sorting = [[1,0],[2,0], [3,0], [4,0]];
                $("#contentHeader th a").removeClass("sortup");
                $("#contentHeader th a").removeClass("sortdown");
                $(this).removeClass("sortup");
                $(this).addClass("sortdown");
            } else {
                var sorting = [[1,1],[2,0], [3,0], [4,0]];
                $("#contentHeader th a").removeClass("sortup");
                $("#contentHeader th a").removeClass("sortdown"); 
                $(this).removeClass("sortdown");
                $(this).addClass("sortup");
            } 
            $("#collection").trigger("sorton",[sorting]); 
            updateLineColors();
        }
        return false; 
    });
    $(".collArtist a").live("click", function() {
        if($("#collection tbody tr").length){
            $("#collection").tablesorter();
             if($(this).attr("class") == "sortup"){
                var sorting = [[2,0], [3,0], [0,0]];
                $("#contentHeader th a").removeClass("sortup");
                $("#contentHeader th a").removeClass("sortdown");
                $(this).removeClass("sortup");
                $(this).addClass("sortdown");
            } else {
                var sorting = [[2,1], [3,0], [0,0]];
                $("#contentHeader th a").removeClass("sortup");
                $("#contentHeader th a").removeClass("sortdown"); 
                $(this).removeClass("sortdown");
                $(this).addClass("sortup");
            } 
            $("#collection").trigger("sorton",[sorting]); 
            updateLineColors();
        }
        return false; 
    });
    $(".collAlbum a").live("click", function() {
        if($("#collection tbody tr").length){
            $("#collection").tablesorter();
             if($(this).attr("class") == "sortup"){
                var sorting = [[3,0], [2,0], [0,0]];
                $("#contentHeader th a").removeClass("sortup");
                $("#contentHeader th a").removeClass("sortdown");
                $(this).removeClass("sortup");
                $(this).addClass("sortdown");
            } else {
                var sorting = [[3,1], [2,0], [0,0]];
                $("#contentHeader th a").removeClass("sortup");
                $("#contentHeader th a").removeClass("sortdown"); 
                $(this).removeClass("sortdown");
                $(this).addClass("sortup");
            }  
            $("#collection").trigger("sorton",[sorting]); 
            updateLineColors();
        }
        return false; 
    });
    $(".collGenre a").live("click", function() {
        if($("#collection tbody tr").length){
            $("#collection").tablesorter();
            if($(this).attr("class") == "sortup"){
                var sorting = [[4,0],[2,0], [3,0], [0,0]];
                $("#contentHeader th a").removeClass("sortup");
                $("#contentHeader th a").removeClass("sortdown");
                $(this).removeClass("sortup");
                $(this).addClass("sortdown");
            } else {
                var sorting = [[4,1], [2,0], [3,0], [0,0]];
                $("#contentHeader th a").removeClass("sortup");
                $("#contentHeader th a").removeClass("sortdown"); 
                $(this).removeClass("sortdown");
                $(this).addClass("sortup");
            }  
            $("#collection").trigger("sorton",[sorting]); 
            updateLineColors();
        }
        return false; 
    });
    
{% endif %}
/***********************************************************************
 * INTERFACE specific                                                  *
 ***********************************************************************
 */ 
{% if library or playlist %}

    /**
     * loads the artist according to the letter which was clicked
     */
    $('#characters a').click(function() {
        $("#contentHeader th a").removeClass("sortup");
        $("#contentHeader th a").removeClass("sortdown");
        $("#collection tbody").fadeOut('fast');
        $('#characters').fadeOut("slow");
        $(".loading").fadeIn("fast");
        var content_show = $(this).html();
        if (content_show == "All"){
            $("#collection tbody").load("{{ URL_PREFIX }}collection/", function (){ 
                $(".loading").fadeOut('fast', function(){
                    $("#collection tbody").fadeIn('fast');
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
            $("#collection tbody").load("{{ URL_PREFIX }}artist/" + content_show + "/", function (){ 
                $(".loading").fadeOut('fast', function(){
                    $("#collection tbody").fadeIn('fast');
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

    /**
     * click on the progressbar to change the part
     */
    $("#progressbar canvas").click(function(e){
        var width = e.layerX - $(this).attr("offsetLeft");
        var duration = $("#player").attr("duration");
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

    // toggle advanced search
    $("#moreButton").click(function() {
        $("#advSearch").slideToggle();
    });
    
    // toggle alphabet search
    $("#alphab li a").click(function() {
        $("#characters").slideToggle();
    });
    
    // call search at one of these events
    $(".search").keyup(function(e) {
        if(e.keyCode == 13) {
            search(true);
        }
    });
    $("#advSearch input").keyup(function(e) {
        if(e.keyCode == 13) {
            search(false);
        }
    });
    $("#searchButton").click(function() {
        search(false);
    });
    
    $("#searchtitle").autocomplete(
        {
			source: "{{ URL_PREFIX }}advautocomplete/title/",
			minLength: 5,
			select: function(event, ui) {
                if (ui.item){
                    $(this).attr("value", ui.item.title);
                }
        }
    });
    
    $("#searchartist").autocomplete(
        {
			source: "{{ URL_PREFIX }}advautocomplete/artist/",
			minLength: 3,
			select: function(event, ui) {
                if (ui.item){
                    $(this).attr("value", ui.item.artist);
                }
        }
    });
    
    $("#searchalbum").autocomplete(
        {
			source: "{{ URL_PREFIX }}advautocomplete/album/",
			minLength: 3,
			select: function(event, ui) {
                if (ui.item){
                    $(this).attr("value", ui.item.album);
                }
        }
    });
    
    $("#searchgenre").autocomplete(
        {
			source: "{{ URL_PREFIX }}advautocomplete/genre/",
			minLength: 3,
			select: function(event, ui) {
                if (ui.item){
                    $(this).attr("value", ui.item.genre);
                }
        }
    });
    
{% endif %}
/***********************************************************************
 * SETTINGS specific                                                   *
 ***********************************************************************
 */ 
{% if settings %}

    $("#resetcoll").click(function() {
        $("#popup").fadeIn("slow");
        $("#popup").addClass("loading");
        $("#popup").load("{{ URL_PREFIX }}settings/resetdb/", function (){ 
            $("#popup").removeClass("loading");
            $("#popup p").fadeIn("slow");
        });       
    });
    
    $("#popup").click(function() {
       $(this).fadeOut("fast");
    });
    
    $("#scancoll").click(function() {
        $("#popup").fadeIn("slow");
        $("#popup").addClass("loading");
        $("#popup").load("{{ URL_PREFIX }}settings/scan/", function (){ 
            $("#popup").removeClass("loading");
            $("#popup p").fadeIn("slow");
        });   
    });
    
{% endif %}
    
});





/***********************************************************************
 * FUNCTIONS                                                           *
 ***********************************************************************
 */

{% if library or playlist %}

function updateLineColors(){
    $("#collection tbody tr").each(function(index) {
        if(index % 2){
            $(this).removeClass("line1");
            $(this).removeClass("line2");
            $(this).addClass("line1");
        } else {
            $(this).removeClass("line1");
            $(this).removeClass("line2");
            $(this).addClass("line2");
        }
    });
}

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
    var all = $("#search input").attr("value");
    var title = encodeURIComponent($("#advSearch tr:eq(0) input").attr("value"));
    var artist = encodeURIComponent($("#advSearch tr:eq(1) input").attr("value"));
    var album = encodeURIComponent($("#advSearch tr:eq(2) input").attr("value"));
    var genre = encodeURIComponent($("#advSearch tr:eq(3) input").attr("value"));
    
    // check if advanced search contains input
    if((title || artist || album || genre) && !simple){
        $("#collection tbody").fadeOut('fast');
        $(".loading").fadeIn("slow");
        var url =  "{{ URL_PREFIX }}advsearch/";
        // FIXME: maybe set this as data instead of url, wouldnt be much
        // shorter though
        var query = "?artist=" + artist + "&amp;title=" + title +
                    "&amp;genre=" + genre + "&amp;album=" + album;
        $("#collection tbody").load(url + query, function (){
            $(".loading").fadeOut('fast', function(){
                $("#collection tbody").fadeIn('slow');
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
        $("#collection tbody").fadeOut('fast');
        $(".loading").fadeIn("slow");
        var searchValue = encodeURIComponent($('.search').attr("value"));
        $("#collection tbody").load( "{{ URL_PREFIX }}searchall/" + searchValue + "/", function() {
            $(".loading").fadeOut('fast');
            $("#collection tbody").fadeIn('slow');
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
 * If the song is loaded play it
 */
function playWhenLoaded(){
    // prevent it from playing the first loaded song when you initially
    // load the site
    if($("body").data("playing") !== 0){
        $("#player")[0].play();
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
 * Function to play or stop a song
 */
function updatePlayPause(){
    var $playButton = $("#playButton img");
    if ($("#player").attr("paused") === true){
        $playButton.attr("src",  "{{ URL_PREFIX }}media/style/img/play.png");
        $playButton.attr("title", "play");
        $playButton.attr("alt", "play");
    } else {
        // update title information
        var title = $("#currentSong tr:eq(0) td").html();
        var artist = $("#currentSong tr:eq(3) td").html();
        document.title = title + " - " + artist;
        $playButton.attr("src",  "{{ URL_PREFIX }}media/style/img/pause.png");
        $playButton.attr("title", "pause");
        $playButton.attr("alt", "pause");
    }
}

/**
 * Function to play or stop a song
 */
function play(){
    if ($("#player").attr("paused") === true){
        $("#player")[0].play();
    } else {
        $("#player")[0].pause();
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
        $repeatButton.attr("src",  "{{ URL_PREFIX }}media/style/img/repeat.png");
        $repeatButton.attr("title", "repeat");
        $repeatButton.attr("alt", "repeat");
    } else if (repeat === "repeat"){
        $("body").data("repeat", "repeatall");
        $repeatButton.attr("src",  "{{ URL_PREFIX }}media/style/img/repeatall.png");
        $repeatButton.attr("title", "repeatall");
        $repeatButton.attr("alt", "repeatall");
    } else {
        $("body").data("repeat", "norepeat");
        $repeatButton.attr("src",  "{{ URL_PREFIX }}media/style/img/repeatoff.png");
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
        $shuffleButton.attr("src",  "{{ URL_PREFIX }}media/style/img/shuffle.png");
        $shuffleButton.attr("title", "shuffle");
        $shuffleButton.attr("alt", "shuffle");
    } else {
        $("body").data("shuffle", "noshuffle");
        $shuffleButton.attr("src",  "{{ URL_PREFIX }}media/style/img/shuffleoff.png");
        $shuffleButton.attr("title", "shuffleoff");
        $shuffleButton.attr("alt", "shuffleoff");
    }
}

/**
 * Updates the filling of the progressbar
 */
function updateProgressBar(){
    // get audio data
    var duration = $("#player").attr("duration");
    var currTime = $("#player").attr("currentTime");
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
    var ctx = $canvas[0].getContext("2d");
    var volume = $("#player").attr("volume");
    if (volume === 0){
        $("#mute img").attr("src", "{{ URL_PREFIX }}media/style/img/muted.png");
    } else {
        $("#mute img").attr("src", "{{ URL_PREFIX }}media/style/img/volume.png");
    }
    var width = Math.floor(volume * 80);
    ctx.clearRect(0,0, 80 ,24);
    ctx.fillStyle = "#333";
    ctx.fillRect(0,0, width, 24);
}


/**
 * Mute or unmute the player
 */
function mute(){
    var volume = $("#player").attr("volume");
    if(volume === 0){
        $("#player").attr("volume", $("body").data("volume"));
    } else {
        $("body").data("volume", volume);
        $("#player").attr("volume", "0");
    }
    updateVolume();
}


/**
 * Jump to the currently playing song in the list
 */
function jumpTo(){
    var songId = $("body").data("playing");
    document.location.hash = "row" + songId;
}

{% endif %}


/***********************************************************************
 * LIBRARY SPECIFIC FUNCTIONS                                          *
 ***********************************************************************
 */
{% if library %}
/**
 * Plays a Song which matches the id
 * @param id = id of the line (without row, like 143)
 *
 */
function playSong(id){

    var lastSong = $("body").data("playing");
    if(lastSong !== 0){
        $("#row" + lastSong).removeClass("playing");
    }
    
    // get song data
    $.getJSON("{{ URL_PREFIX }}song_data/" + id + "/", function(json){
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
        
        if ($("#player").attr("paused")){
            $("#player").attr("src", "{{ URL_PREFIX }}media/audio/" + json.path);
            $("#player")[0].load();
        } else {
            $("#player")[0].pause();
            $("#player").attr("src", "{{ URL_PREFIX }}media/audio/" + json.path);
            $("#player")[0].load();
            // note: we direct playing to playWhenLoaded, which starts
            // playing when the song is being loaded
        }
        // store the id for later use
        $("body").data("playing", id);
        $("#row" + id).addClass("playing");
        // scrobble song
        $.get("{{ URL_PREFIX }}scrobble/" + id + "/");
        // get album data
        $.getJSON("{{ URL_PREFIX }}cover/" + id + "/", function(json){
            $("#cover img").attr("src", json.coverpath);
            $("#cover img").attr("title", json.album);
            $("#cover img").attr("alt", json.album);
        });
    });
    
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

{% endif %}


/***********************************************************************
 * PLAYLIST SPECIFIC FUNCTIONS                                          *
 ***********************************************************************
 */
{% if playlist %}
/**
 * Plays a Song which matches the id
 * @param id = id of the line (without row, like 143)
 *
 */
function playSong(id){
    
}


/**
 * Function to play the next song in line, checks for repeat and shuffle
 * activated
 */
function nextSong(){

}


/**
 * Function to play the previous song
 */
function prevSong(){

}

{% endif %}
