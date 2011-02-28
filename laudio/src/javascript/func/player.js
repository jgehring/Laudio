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


/**
 * Plays a Song which matches the id
 * @param id = id of the line (without row, like 143)
 *
 */
function play_song(id, tr){
    
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
        
        // get some stored values
        var lastSong = db("playing", false);
        var volume = db("volume", false);

        // stop the currently playing song and remove the playing class from 
        // the previous played song
        if(lastSong !== 0){
            $(".playing").removeClass("playing");
            soundManager.stopAll()
        }

        // play song
        soundManager.createSound({
            id: json.id,
            url: '{% url laudio.views.laudio_index %}media/audio/' +  json.path,
            volume: volume,
        });

        soundManager.play(json.id, {
            onfinish: function() {
                update_pause_icon() 
                next_song();
                // scrobble song
                $.get("{% url laudio.views.laudio_index %}scrobble/" + json.id + "/"); 
            },
            onpause: function() {
                update_pause_icon();
            },
            onplay: function() {
                update_play_icon();
            },
            onresume: function() {
                update_play_icon();
            },
            whileplaying: function() {
                update_progressbar(this);
            },
        });

        // store the id for later use
        db("playing", id);
    
        // update title information
        title =  json.title + " - " + json.artist;
        document.title = decode_html_entities(title);
        // set the background color for the song
        $( "#" + tr ).addClass("playing");
        
        
        // get cover
        $.getJSON("{% url laudio.views.laudio_index %}cover/" + id + "/", function(json){
            $("#cover img").attr("src", json.coverpath);
            $("#cover img").attr("title", json.album);
            $("#cover img").attr("alt", json.album);
        });
        
    });
    
}

/**
 * Mute or unmute the player
 */
function mute(){
    var playing = db("playing", false);
    soundManager.toggleMute(playing);
}

/**
 * Function to play or stop a song
 */
function play_pause(){
    var playing = db("playing", false);
    soundManager.togglePause(playing);
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
    var playlist = db("playlist", false);
    
    // adjust playlist variables
    if( playlist === 0){
        var $currentSong = $( id_to_row(songId, true) );
        var tableId = "#collection";
    } else {
        var $currentSong = $( id_to_plrow(songId, true) );
        var tableId = "#playlistSongs";
    }
    
    // First we got to check for repeat, 1 = repeat, 2 = repeat all
    //                                   0 = no repeat
    if (repeat === 1){
        
        return songId;
    
    } else if(repeat === 2){
        
        /* If the next song on the list isnt there, we return
         * the first song in the list
         */
        if ($currentSong.next().length === 0){
            
            if(playlist === 0){
                // check if there is a first song
                if($("#collection tbody tr:first").length !== 0){
                    var id = $("#collection tbody tr:first").attr("id");
                    return row_to_id(id);
                } else {
                    return false;
                }
            } else {
                // check if there is a first song
                if($("#playlistSongs tbody tr:first").length !== 0){
                    var id = $("#playlistSongs tbody tr:first").attr("title");
                    return id;
                } else {
                    return false;
                }
            }
            
        }
    }
    
    
    // then check for shuffle, 1 = shuffle, 0 = no shuffle
    if (shuffle === 1){
        
        if(playlist === 0){
            // calculate a random number
            var entriesLen = $("#collection tbody tr").length;
            var randNumber = Math.floor(Math.random() * entriesLen);
            var randId = $("#collection tbody tr:eq(" + randNumber + ")").attr("id");
            return row_to_id(randId);
        } else {
            // calculate a random number
            var entriesLen = $("#playlistSongs tbody tr").length;
            var randNumber = Math.floor(Math.random() * entriesLen);
            var randId = $("#playlistSongs tbody tr:eq(" + randNumber + ")").attr("title");
            return randId;

        }
        
    }
    
    // If no repeat and shuffle were enabled, just return the next song
    if($currentSong.next().length !== 0){
        
        if(playlist === 0){
            var nextSongId = $currentSong.next().attr("id");
            return row_to_id(nextSongId);
        } else {
            var nextSongId = $currentSong.next().attr("title");
            return nextSongId;
        }
        
    } else {
        // if current song which is playing is not in the collection, play 
        // the first song in the list
        if( $currentSong.length === 0 && $(tableId + " tbody tr:first").length !== 0){
            if(playlist === 0){
                var id = $("#collection tbody tr:first").attr("id");
                return row_to_id(id);
            } else {
                var id = $("#playlistSongs tbody tr:first").attr("title");
                return id;                
            }
        } else {
            return false;
        }
    }
    
}

/**
 * Gets called when we want to play the next song
 */
function next_song(){
    var songId = get_next_song();
    if (songId !== false){
        if( db("playlist", false) === 0){
            var $currentSong = $( id_to_row(db("playing", false), true) )
            play_song(songId, $currentSong.next().attr("id"));
        } else {
            var $currentSong = $('[title="'+db("playing", false)+'"]')
            play_song(songId, $currentSong.next().attr("id"));
        }
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
