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
    soundManager.flashVersion = 8;
    soundManager.debugFlash = true;
    soundManager.audioFormats.mp4.required = false;
    db("playing", 0);
    db("volume", 100);
    db("shuffle", 0);
    db("repeat", 0);
    db("selected", "row0");
    db("playlist", 0);
    db("playlistIdCounter", 0);
    db("playlistPlaying", 0);
    
    // check for shift key pressed
    db("shift", 0);
    
    $(window).keydown(function(e) {
        if(e.which === 16){
            db("shift", 1);
            return false;
        }
    });
    
    $(window).keyup(function(e) {
        if(e.which === 16){
            db("shift", 0);
            return false;
        }
    });
    
    // check for ctrl key pressed
    db("ctrl", 0);
    
    $(window).keydown(function(e) {
        if(e.which === 17){
            db("ctrl", 1);
            return false;
        }
    });
    
    $(window).keyup(function(e) {
        if(e.which === 17){
            db("ctrl", 0);
            return false;
        }
    });


    
    

    
});



/**
 * Colors all lines in the collection
 */
function update_line_colors(id){
    $(id + " tbody tr").each(function(index) {
        
        if(index % 2){
            
            $(this).removeClass("line1");
            $(this).removeClass("line2");
            $(this).addClass("line2");
        } else {
            
            $(this).removeClass("line1");
            $(this).removeClass("line2");
            $(this).addClass("line1");
            
        }
        
    });
}


/**
 * Selects a line (sets a darker bg) when you click on it
 * @param id = id of the line
 *
 */
function select_line(id, context){
    
    // check if new selection is already selected
    if( !($("#" + id).hasClass("selected") && context === 1) ){
    
        if( db("shift", false) === 0){
            
            if( db("ctrl", false) === 0){
                $(".selected").removeClass("selected");
            }
            
            $("#" + id).addClass("selected");
            
            // store selection
            db("selected", id);
            
        } else {
            
            // check in which direction we have to select
            if( $("#" + db("selected", false) ).index() <= $("#" + id).index() ){
                var from = db("selected", false);
                var to = id;
            } else {
                var from = id;
                var to = db("selected", false);
            }
            
            $("#" + from).nextUntil("#" + to + " + *").addClass("selected");
            db("selected", id);
        }
    }
}


/**
 * Sets the context menu for the current elements in the list
 */
function collection_context_menu(){
    // set context menu details
    var songMenu = [
        {
            'Play': {
                onclick: function(menuItem, menu) { 
                    var id = row_to_id(this.id);
                    play_song(id, this.id);
                },
                icon: "{% url laudio.views.laudio_index %}media/style/img/play_small.png",
            }
                        
        }, $.contextMenu.separator, 
        {
            'Add to Playlist': {
                onclick: function(menuItem, menu) {
                    var idrow = db("playlistIdCounter", false);
                    $(".selected").each( function(){
                        
                        idrow+=1;
                        
                        var id = row_to_id( $(this).attr("id") );
                        var title = $(this).children("td:eq(1)").html();
                        var artist = $(this).children("td:eq(2)").html();

                        $("#playlistSongs > tbody").append($("<tr>")
                            .attr("title", id)
                            .attr("id", "plrow" + idrow)
                            .dblclick( function(){
                                db("playlist", 1);
                                play_song(this.title, this.id);
                            })
                            .click( function(){
                                select_line(this.id, 0);
                            })
                            .click()
                            .append($("<td>")
                                .html(artist + " - " + title)
                            )
                        );
                           
                        
                    });
                    update_line_colors("#playlistSongs");
                    playlist_context_menu();
                    db("playlistIdCounter", idrow);
                },
                icon: "{% url laudio.views.laudio_index %}media/style/img/add_small.png",
            }
                        
        }, 
        {
            'Download': {
                onclick: function(menuItem, menu) {
                    $(".selected").each( function(){
                        var id = row_to_id( $(this).attr("id") );
                        window.open("{% url laudio.views.laudio_index %}song_download/" + id + "/");
                    });
                },
                icon: "{% url laudio.views.laudio_index %}media/style/img/download_small.png",
            }
        }, 
        
        $.contextMenu.separator, 
                    
        {
            'Select All': function(){
                $('#collection tbody tr').addClass("selected");
            }
        }
    ];
    
    // bind context menu to the collection
    $(function() {
        $('#collection tbody tr').contextMenu(songMenu,
            { 
                theme:'vista',
            }
        ); 
    });
}


/**
 * Selects a line (sets a darker bg) when you click on it
 * @param id = id of the line
 *
 */
function select_line(id, context){
    
    // check if new selection is already selected
    if( !($("#" + id).hasClass("selected") && context === 1) ){
    
        if( db("shift", false) === 0){
            
            if( db("ctrl", false) === 0){
                $(".selected").removeClass("selected");
            }
            
            $("#" + id).addClass("selected");
            
            // store selection
            db("selected", id);
            
        } else {
            
            // check in which direction we have to select
            if( $("#" + db("selected", false) ).index() <= $("#" + id).index() ){
                var from = db("selected", false);
                var to = id;
            } else {
                var from = id;
                var to = db("selected", false);
            }
            
            $("#" + from).nextUntil("#" + to + " + *").addClass("selected");
            db("selected", id);
        }
    }
}

