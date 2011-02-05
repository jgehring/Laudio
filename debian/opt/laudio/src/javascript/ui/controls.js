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
    
    $("#player")[0].addEventListener("playing", update_play_pause, true);
    $("#player")[0].addEventListener("pause", update_play_pause, true);
    $("#player")[0].addEventListener("timeupdate", update_progressbar, true);
    $("#player")[0].addEventListener("progress", update_loaded, true);
    $("#player")[0].addEventListener("volumechange", update_volume, true);
    
    
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
        // simple clicking
        var width = e.layerX - $(this).attr("offsetLeft");
        var ctx = $(this)[0].getContext("2d");
        ctx.clearRect(0,0, 80 ,24);
        ctx.fillStyle = "#333";
        ctx.fillRect(0,0, width ,24);
        var volume = width / 80;
        $("#player").attr("volume", volume); 
        db( "volume", $("#player").attr("volume") );
        clicking = true;
        
        $(this).mousemove(function(e){
            // clicking and moving the mouse
            if(clicking === false) return;
            var width = e.layerX - $(this).attr("offsetLeft");
            var ctx = $(this)[0].getContext("2d");
            ctx.clearRect(0,0, 80 ,24);
            ctx.fillStyle = "#333";
            ctx.fillRect(0,0, width ,24);
            var volume = width / 80;
            $("#player").attr("volume", volume);
            db( "volume", $("#player").attr("volume") );
        });
    });

    /**
     * If click on the progressbar, the player will jump to that position
     */
    $("#progressbar canvas").click(function(e){
        
        var width = e.layerX - $(this).attr("offsetLeft");
        var duration = $("#player").attr("duration");
        var position = Math.floor( (duration / 300) * width );
        $("#player").attr("currentTime", position);   
        
    });

});

/***********************************************************************
 * Events which are triggered by control elements                      *
 ***********************************************************************


/**
 * Updates the filling of the progressbar
 */
function update_progressbar(){
    // get audio data
    var duration = $("#player").attr("duration");
    var currTime = $("#player").attr("currentTime");
    
    // prevent duration from being Nan
    if(isNaN(duration)){
        duration = db("duration", false);
    }
    var width = 0;
    // calculate how the progressbar is being filled
    width = Math.floor((300 / duration) * currTime);    
    var $canvas = $("#progressbar canvas");
    var ctx = $canvas[0].getContext("2d");
    ctx.clearRect(0,0, 300 ,24);
    // fill loaded bar
    ctx.fillStyle = "#666";
    ctx.fillRect(0,0, db("loaded", false) ,24);
    // fill rectangle which indicates position in the song
    ctx.fillStyle = "#333";
    ctx.fillRect(0,0, width ,24);
    $("#progressbar").attr("title", Math.floor(currTime) + "/" + Math.floor(duration));    
}


/**
 * Updates the progressbar according to the loaded data
 */
function update_loaded(e){
    // only start computed the loaded data if we know that we can compute it
    if(e.lengthComputable){
        var width = Math.floor( (e.loaded * 300) / e.total );
        db("loaded", width);
        update_progressbar();
    }    
}


function update_play_pause(){
    var $img = $("#play img");
    
    if ($("#player").attr("paused") === true){
        
        $img.attr("src",  "{% url laudio.views.laudio_index %}media/style/img/play.png");
        $img.attr("title", "play");
        $img.attr("alt", "play");
        
    } else {
        
        // update title information
        var title = $("#currentSong tr:eq(0) td").html();
        var artist = $("#currentSong tr:eq(3) td").html();
        document.title = title + " - " + artist;
        $img.attr("src",  "{% url laudio.views.laudio_index %}media/style/img/pause.png");
        $img.attr("title", "pause");
        $img.attr("alt", "pause");
        
    }
}

/**
 * Updates the volume bar according to the volume set
 */
function update_volume(){
    var $canvas = $("#volume canvas");
    var ctx = $canvas[0].getContext("2d");
    var volume = $("#player").attr("volume");
    
    if (volume === 0){
        $("#mute img").attr("src", "{% url laudio.views.laudio_index %}media/style/img/muted.png");
    } else {
        $("#mute img").attr("src", "{% url laudio.views.laudio_index %}media/style/img/volume.png");
    }
    
    var width = Math.floor(volume * 80);
    ctx.clearRect(0,0, 80 ,24);
    ctx.fillStyle = "#333";
    ctx.fillRect(0,0, width, 24);
}
