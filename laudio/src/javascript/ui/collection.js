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
    soundManager.url = '{% url laudio.views.laudio_index %}media/js/soundmanager/swf/';
    soundManager.useHTML5Audio = true;
    db("playing", 0);
    db("volume", 100);
    db("shuffle", 0);
    db("repeat", 0);
});

/**
 * Colors all lines in the collection
 */
function update_line_colors(){
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


/**
 * Selects a line (sets a darker bg) when you click on it
 * @param id = id of the line (without row, like 143)
 *
 */
function select_line(id){
    var lastSong = db("select", false);
    $("#row" + lastSong).removeClass("selected");
    // store the id for later use
    db("select", id);
    $("#row" + id).addClass("selected");
}
