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
 
 
{% if AUDIO_DEBUG %}
 
 $(document).ready(function() { 
     
    $("#player")[0].addEventListener("loadstart", debug_loadstart, true);
    $("#player")[0].addEventListener("progress", debug_progress, true);
    $("#player")[0].addEventListener("suspend", debug_suspend, true);
    $("#player")[0].addEventListener("error", debug_error, true);
    $("#player")[0].addEventListener("stalled", debug_stalled, true);
    $("#player")[0].addEventListener("abort", debug_abort, true);
    $("#player")[0].addEventListener("emptied", debug_emptied, true);
    $("#player")[0].addEventListener("play", debug_play, true);
    $("#player")[0].addEventListener("pause", debug_pause, true);
    $("#player")[0].addEventListener("loadedmetadata", debug_loadedmetadata, true);
    $("#player")[0].addEventListener("loadeddata", debug_loadeddata, true);
    $("#player")[0].addEventListener("waiting", debug_waiting, true);
    $("#player")[0].addEventListener("playing", debug_playing, true);
    $("#player")[0].addEventListener("canplay", debug_canplay, true);
    $("#player")[0].addEventListener("canplaythrough", debug_canplaythrough, true);
    $("#player")[0].addEventListener("seeking", debug_seeking, true);
    $("#player")[0].addEventListener("seeked", debug_seeked, true);
    $("#player")[0].addEventListener("ended", debug_ended, true);
    $("#player")[0].addEventListener("ratechange", debug_ratechange, true);
    $("#player")[0].addEventListener("durationchange", debug_durationchange, true);
    $("#player")[0].addEventListener("volumechange", debug_volumechange, true);
    


 });

function debug_durationchange(){
    debug_log("Duration changed", "durationchange");
}

function debug_volumechange(){
    debug_log("Volume changed", "volumechange");
}

function debug_ratechange(){
    debug_log("Rate changed", "ratechange");
}

function debug_ended(){
    debug_log("Song ended", "ended");
}

function debug_seeked(){
    debug_log("Done seeking", "seeked");
}

function debug_seeking(){
    debug_log("Seeking data in song", "seeking");
}

function debug_canplaythrough(){
    debug_log("Enough data to play through the whole song", "canplaythrough");
}

function debug_waiting(){
    debug_log("Waiting/Expecting for more data to play song", "waiting");
}

function debug_playing(){
    debug_log("Started to play song", "playing");
}

function debug_canplay(){
    debug_log("Song can start to play", "canplay");
}


function debug_loadedmetadata(){
    debug_log("Metadata loaded", "loadedmetadata");
}

function debug_loadeddata(){
    debug_log("Loaded enough data to play", "loadeddata");
}

function debug_play(){
    debug_log("Playing song", "play");
}

function debug_pause(){
    debug_log("Paused song", "pause");
}

function debug_emptied(){
    debug_log("Songfile is broken or load method was invoked to early", "emptied");
}

function debug_abort(){
    debug_log("Stopped loading unfinished song", "abort");
}

function debug_progress(){
    debug_log("Continued to load unfinished song", "progress");
}
 
function debug_loadstart(){
    debug_log("Started to load song", "loadstart");
}

function debug_suspend(){
    debug_log("Stopped loading unfinished song", "suspend");
}

function debug_stalled(){
    debug_log("Try to load song but not getting any data", "stalled");
}

function debug_error(){
    var codes = new Array("The fetching process for the media resource was aborted by the user agent at the user's request.", 
                          "A network error of some description caused the user agent to stop fetching the media resource, after the resource was established to be usable.",
                          "An error of some description occurred while decoding the media resource, after the resource was established to be usable.",
                          "The media resource indicated by the src attribute was not suitable."
                        );
    var code = $("#player")[0].error.code;
    var msg = "An error occured: " + codes[code];
    debug_log(msg, "error");
}




/**
 * This function sends debug messages to the server
 * @param String msg:   The message you want to save
 * @param String event: The event which occured
 */
function debug_log(msg, event){
    var date = new Date();
    var timestamp = date.getTime();
    var debugUrl = "{% url laudio.views.ajax_debug_log %}";
    var songid = db("playing", false);
    $.ajax({ 
                url: debugUrl,
                type: "POST",
                data: { date: timestamp, msg: msg, event: event, songid: songid }
            }
    );
}


{% endif %}
