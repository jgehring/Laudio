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
    
    {% if GAPLESS_PLAYBACK %}
        $("#player")[0].addEventListener("progress", precache, true);
    {% endif %}

    db("playing", 0);
    db("select", 1);
    db("repeat", 0);
    db("shuffle", 0);
    db("volume", 1);

    // default Eventlisteners
    $("#player")[0].addEventListener("ended", next_song, true);
    $("#player")[0].addEventListener("canplay", play_when_loaded, true);

});


/**
 * Precache the next song if shuffle is not activated and the currently
 * played song finished loading
 */
function precache(e){
    if(e.loaded === e.total){
        // check if shuffle is not activated, if so we cant precache the
        // next song
        // if the next song has also be transcoded, do it now
        if (db("shuffle", false) === 0){
            {% if TRANSCODE %}
                // load the next song
                var nextSongId = get_next_song();
                $.getJSON("{% url laudio.views.laudio_index %}song_data/" + nextSongId + "/", function(json){
                    // check if browser supports codec
                    var canPlayType = $("#player")[0].canPlayType("audio/" + json.codec);
                    
                    // check if we need to transcode
                    if( json.codec !== "ogg" && !canPlayType.match(/maybe|probably/i) ){
                        $.getJSON("{% url laudio.views.laudio_index %}transcode/" + json.id + "/", function(transcoded){
                            var songpath = "{% url laudio.views.laudio_index %}media/tmp/" + transcoded.path;
                            $("#gapless").attr("src", songpath);
                            $("#gapless")[0].load();
                        });
                    
                    } else {
                        // load the next song
                        $("#gapless").attr("src", "{% url laudio.views.laudio_index %}media/audio/" + json.path);
                        $("#gapless")[0].load();
                    }
                });
        
            {% else %}
        
                // load the next song
                var nextSongId = get_next_song();
                $.getJSON("{% url laudio.views.laudio_index %}song_data/" + nextSongId + "/", function(json){
                    $("#gapless").attr("src", "{% url laudio.views.laudio_index %}media/audio/" + json.path);
                    $("#gapless")[0].load();
                });
            
            {% endif %}
        
        }
    }
}

/**
 * Mute or unmute the player
 */
function mute(){
    var volume = $("#player").attr("volume");
    if(volume === 0){
        $("#player").attr("volume", db("volume", false));
    } else {
        db( "volume", $("#player").attr("volume") );
        $("#player").attr("volume", 0);
    }
}

/**
 * Function to play or stop a song
 */
function play_pause(){
    if ($("#player").attr("paused") === true){
        $("#player")[0].play();
    } else {
        $("#player")[0].pause();
    }
}


/**
 * Function to play the previous song
 * 
 * @return Integer: Id of the previous song
 */
function get_previous_song(){
    var $currentSongTR = $( id_to_row( db("playing", false), true ) );
    
    // check if the song is in the current selection
    // if not, return the id of the first song
    if($currentSongTR.length === 0){
        
        var id = $("#collection tbody tr:first").attr("id");
        return row_to_id(id);
        
    } else {
        
        // check if the played song is the first in the list
        if ($currentSongTR.prev().length !== 0){
            
            var id = $currentSongTR.prev().attr("id");
            return row_to_id(id);
            
        } else {
            
            return false;
            
        }
        
    }
}


/**
 * Function to play the next song
 * 
 * @return Integer: Id of the next song
 */
function get_next_song(){
    var songId = db("playing", false);
    var shuffle = db("shuffle", false);
    var repeat = db("repeat", false); 
    
    // First we got to check for repeat, 1 = repeat, 2 = repeat all
    //                                   0 = no repeat
    if (repeat === 1){
        
        return songId;
    
    } else if(repeat === 2){
        
        /* If the next song on the list isnt there, we return
         * the first song in the list
         */
        if ($( id_to_row(songId, true) ).next().length === 0){
            
            var id = $("#collection tbody tr:first").attr("id");
            return row_to_id(id);
            
        }
    }
    
    
    // then check for shuffle, 1 = shuffle, 0 = no shuffle
    if (shuffle === 1){
        
        // calculate a random number
        var entriesLen = $("#collection tbody tr").length;
        var randNumber = Math.floor(Math.random() * entriesLen);
        randId = $("#collection tbody tr:eq(" + randNumber + ")").attr("id");
        return row_to_id(randId);
        
    }
    
    // If no repeat and shuffle were enabled, just return the next song
    if($( id_to_row(songId, true) ).next().length !== 0){
        
        var nextSongId = $( id_to_row(songId, true) ).next().attr("id");
        return row_to_id(nextSongId);

    } else {
    
        return false;
        
    }
    
}

/**
 * Gets called when we want to play the next song
 */
function next_song(){
    var songId = get_next_song();
    if (songId !== false){
        play_song(songId);
    }
}

/**
 * Gets called when we want to play the previous song
 */
function previous_song(){
    var songId = get_previous_song();
    if (songId !== false){
        play_song(songId);
    }
}


/**
 * If the song is loaded play it
 */
function play_when_loaded(){
    // prevent it from playing the first loaded song when you initially
    // load the site
    if($("body").data("playing") !== 0){
        $("#player")[0].play();
    }
}


/**
 * Plays a Song which matches the id
 * @param id = id of the line (without row, like 143)
 *
 */
function play_song(id){

    var lastSong = db("playing", false);
    if(lastSong !== 0){
        $( id_to_row(lastSong, true) ).removeClass("playing");
    }
    
    // get song data
    $.getJSON("{% url laudio.views.laudio_index %}song_data/" + id + "/", function(json){
        
        // store duration, then get mins and secs
        db("duration", json.duration);
        mins = Math.floor(json.duration / 60);
        secs = json.duration % 60;
        if(secs < 10){
            secs = "0" + secs;
        }
        
        // set info in sidebar
        $("#currentSong tr:eq(0) td").html(json.title);
        $("#currentSong tr:eq(1) td").html(mins + ":" + secs);
        $("#currentSong tr:eq(2) td").html(json.tracknr);
        $("#currentSong tr:eq(3) td").html(json.artist);
        $("#currentSong tr:eq(4) td").html(json.album);
        $("#currentSong tr:eq(5) td").html(json.date);
        $("#currentSong tr:eq(6) td").html(json.genre);
        $("#currentSong tr:eq(7) td").html(json.codec);
        $("#currentSong tr:eq(8) td").html(json.bitrate +  " kb/s");
        
        // load song
        check_and_load_song(json.id, json.path, json.codec);
        
        // set volume back to selected value
        $("#player").attr("volume", db("volume", false));
        
        // store the id for later use
        db("playing", id);
        $( id_to_row(id, true) ).addClass("playing");
        
        // scrobble song
        $.get("{% url laudio.views.laudio_index %}scrobble/" + id + "/");
        
        // get cover
        $.getJSON("{% url laudio.views.laudio_index %}cover/" + id + "/", function(json){
            $("#cover img").attr("src", json.coverpath);
            $("#cover img").attr("title", json.album);
            $("#cover img").attr("alt", json.album);
        });
        
    });
    
}

/**
 * Stuff which has to get checked before a song is being loaded, e.g.
 * if the browser can play the file or if the file needs to be transcoded
 * @param Integer id:   Id of the song
 * @param String path:  Path to the song
 * @param String codec: Codec of the song
 */
function check_and_load_song(id, path, codec){
    // check if browser supports codec
    var canPlayType = $("#player")[0].canPlayType("audio/" + codec);
        
    {% if TRANSCODE %}
        // check if we have to transcode
        if( codec !== "ogg" && !canPlayType.match(/maybe|probably/i) ){
            $(".loading").fadeIn("slow");
            $.getJSON("{% url laudio.views.laudio_index %}transcode/" + id + "/", function(transcoded){
                var songpath = "{% url laudio.views.laudio_index %}media/tmp/" + transcoded.path;
                $(".loading").fadeOut('fast');
                load_song(songpath);
            });
        } else {
            var songpath = "{% url laudio.views.laudio_index %}media/audio/" + path;
            load_song(songpath);
        }
        
    {% else %}
        if(!canPlayType.match(/maybe|probably/i)) {
            alert("Browser does not support codec " + codec + "!")
            return false;
        }
        var songpath = "{% url laudio.views.laudio_index %}media/audio/" + path;
        load_song(songpath);
    {% endif %}
}

/**
 * Loads a song
 * @param String songpath: Path to the song
 */
function load_song(songpath){
    // load the song into the player tag
    if ($("#player").attr("paused")){
        $("#player").attr("src", songpath);
        $("#player")[0].load();
        
    } else {
        $("#player")[0].pause();
        $("#player").attr("src", songpath);
        $("#player")[0].load();
    }
}
