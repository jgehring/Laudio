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
    
    // update volume
    update_volume();
    
    
    $("#previoussong").click(function(){
        previous_song();
    });
    
    
    $("#nextsong").click(function(){
        next_song();
    });
    
    
    $("#play").click(function(){
        play_pause();
    });
    
    
    $("#mute").click(function(){
        mute();
    });
    
    
    /**
     * If the user clicks on it the view jumps to the currently played
     * song
     */
    $("#jumpto").click(function(){
        document.location.hash = id_to_row( db("playing", false) );
    });
    
    
    /**
     * Shuffle: Either shuffle is on or off
     */
    $("#shuffle").click(function(){
        var shuffle = db("shuffle", false);
        var $img = $("#shuffle img");
        
        // 0 = no shufle activated, 1 = shuffle activated
        if(shuffle === 0){
            
            db("shuffle", 1);
            $img.attr("src",  "{% url laudio.views.laudio_index %}media/style/img/shuffle.png");
            $img.attr("title", "shuffle");
            $img.attr("alt", "shuffle");
            
        } else {
            
            db("shuffle", 0);
            $img.attr("src",  "{% url laudio.views.laudio_index %}media/style/img/shuffleoff.png");
            $img.attr("title", "shuffleoff");
            $img.attr("alt", "shuffleoff");
            
        }
    });
    
    
    /**
     * Repeat: Can have 3 values: no repeat, repeat and repeat all
     */
    $("#repeat").click(function(){
        var repeat = db("repeat", false);
        var $img = $("#repeat img");
        
        // 0 = no repeat, 1 = repeat, 2 = repeat all
        if(repeat === 0){
            
            db("repeat", 1);
            $img.attr("src",  "{% url laudio.views.laudio_index %}media/style/img/repeat.png");
            $img.attr("title", "repeat");
            $img.attr("alt", "repeat");
            
        } else if (repeat === 1){
            
            db("repeat", 2);
            $img.attr("src",  "{% url laudio.views.laudio_index %}media/style/img/repeatall.png");
            $img.attr("title", "repeat all");
            $img.attr("alt", "repeat all");
            
        } else {
            
            db("repeat", 0);
            $img.attr("src",  "{% url laudio.views.laudio_index %}media/style/img/repeatoff.png");
            $img.attr("title", "repeat off");
            $img.attr("alt", "repeat off");

        }
    });
    
    
    /**
     * If the mouse is released anywhere on the site, set clicking to false
     * and slide up search stuff, we need this for volume changing
     */
    $("#site").mouseup(function(){
        clicking = false;
    }); 
    
    
    /**
     * Click on the volume bar to change it
     */
    $("#volume canvas").mousedown(function(e){
        var playing = db("playing", false);
        // simple clicking
        var width = e.layerX - $(this).attr("offsetLeft");
        var ctx = $(this)[0].getContext("2d");
        ctx.clearRect(0,0, 80 ,24);
        ctx.fillStyle = "#333";
        ctx.fillRect(0,0, width ,24);
        var volume = Math.floor(width / 0.8);
        if(playing !== 0){
            soundManager.getSoundById(playing).setVolume(volume);
        }
        db("volume", volume);
        clicking = true;
        
        $(this).mousemove(function(e){
            // clicking and moving the mouse
            if(clicking === false) return;
            var width = e.layerX - $(this).attr("offsetLeft");
            var ctx = $(this)[0].getContext("2d");
            ctx.clearRect(0,0, 80 ,24);
            ctx.fillStyle = "#333";
            ctx.fillRect(0,0, width ,24);
            var volume = Math.floor(width / 0.8);
            if(playing !== 0){
                soundManager.getSoundById(playing).setVolume(volume);
            }
            db("volume", volume);
       });
    });

    /**
     * If click on the progressbar, the player will jump to that position
     */
    $("#progressbar canvas").click(function(e){
        var playing = db("playing", false);
        var width = e.layerX - $(this).attr("offsetLeft");
        var duration = soundManager.getSoundById(playing).duration;
        var position = Math.floor( (duration / 300) * width );
        soundManager.getSoundById(playing).setPosition(position);
    });

});

/***********************************************************************
 * Events which are triggered by control elements                      *
 ***********************************************************************


/**
 * Updates the filling of the progressbar
 */
function update_progressbar(song){
    // get audio data
    if(song.isBuffering){
        var duration = song.durationEstimate / 1000;
    } else {
        var duration = song.duration / 1000;
    }
    var currTime = song.position / 1000;
    var $canvas = $("#progressbar canvas");
    var ctx = $canvas[0].getContext("2d");
    ctx.clearRect(0,0, 300 ,24);
    // fill loaded bar
    var loaded =  song.bytesLoaded / song.bytesTotal;
    ctx.fillStyle = "#666";
    ctx.fillRect(0,0, Math.floor(loaded * 300) ,24);
    // fill rectangle which indicates position in the song
    width = Math.floor((300 / duration) * currTime);  
    ctx.fillStyle = "#333";
    ctx.fillRect(0,0, width ,24);
    $("#progressbar").attr("title", Math.floor(currTime) + "/" + Math.floor(duration));    
}


function update_play_icon(){
    var $img = $("#play img"); 
    $img.attr("src",  "{% url laudio.views.laudio_index %}media/style/img/pause.png");
    $img.attr("title", "pause");
    $img.attr("alt", "pause");
}

function update_pause_icon(){
    var $img = $("#play img");
    $img.attr("src",  "{% url laudio.views.laudio_index %}media/style/img/play.png");
    $img.attr("title", "play");
    $img.attr("alt", "play");
}


/**
 * Updates the volume bar according to the volume set
 */
function update_volume(){
    var playing = db("playing", false);
    if(playing !== 0){
        if(soundManager.getSoundById(playing).muted){
            var volume = 0;
        } else {
            var volume = soundManager.getSoundById(playing).volume;
        }
    } else {
        
        var volume = 100;
    }

    var $canvas = $("#volume canvas");
    var ctx = $canvas[0].getContext("2d");
    
    if (volume === 0){
        $("#mute img").attr("src", "{% url laudio.views.laudio_index %}media/style/img/muted.png");
    } else {
        $("#mute img").attr("src", "{% url laudio.views.laudio_index %}media/style/img/volume.png");
    }
    
    var width = Math.floor(volume * 0.8);
    ctx.clearRect(0,0, 80 ,24);
    ctx.fillStyle = "#333";
    ctx.fillRect(0,0, width, 24);
}
