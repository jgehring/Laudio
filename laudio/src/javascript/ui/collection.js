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

    $("#playlistSongs tbody").sortable({
        revert: true,
        stop: function(){
            update_line_colors("#playlistSongs");
        }
    });
    
    

    
});


/**
 * Loads a playlist
 * 
 * @param integer id: the id of the playlist
 */
function load_playlist(id){
    // Start eyecandy animation
    $("#playlistSongs tbody").fadeOut('fast');
    $("#playlist .loading").fadeIn("slow");
    cancel_playlist();
    // and unbind previous items from context to prevent slowdown
    $("#playlistSongs tbody tr").unbind("contextmenu");
    
    set_playlist_name(id);
    
    var url = "{% url laudio.views.laudio_index %}playlist/open/" + id + "/";
    // now that we got the get url, start query
    $("#playlistSongs tbody").load(url, function (){
        $("#playlist .loading").fadeOut('fast', function(){
            $("#playlistSongs tbody").fadeIn('slow');
            // set color to just playing song
            var lastSong = db("playlistPlaying", false);;
            
            // if we didnt just start it see if the currently played
            // song is in the collection and highlight it
            if (lastSong !== 0 && db("playlist", false) === 1){
                $( id_to_plrow(lastSong, true) ).addClass("playing");
            }
            
            // update context menu
            playlist_context_menu();
        });
    });
}

/**
 * Sets the name of the playlist
 * @param integer id: the id of the playlist
 */
function set_playlist_name(id){
    // set playlist name
    var url = "{% url laudio.views.laudio_index %}playlist/getname/" + id + "/";
    $.get(url).then(function(data){
        $("#playlistName").html(data);
    });
}

/**
 * Deletes a playlist
 * @param integer id: the id of the playlist
 */
function delete_playlist(id, name, confirm){
    // set playlist name
    if(confirm === false){
        $("#playlistList").fadeOut("fast", function(){
            $("#playlistConfirm th").html("Do you really want to delete playlist " + name+"?");
            $("#playlistConfirm").fadeIn("fast");
            $("#confirmYes").unbind("click");
            $("#confirmYes").click( function(){
               delete_playlist(id, name, true); 
            });
        });
    } else {
        var url = "{% url laudio.views.laudio_index %}playlist/delete/" + id + "/";
        $.get(url, function(){
            cancel_playlist();
        });
    }
}


/**
 * Saves a playlist
 * 
 * @param string name: name of the playlist
 * @param string songs: songids split with commas, e.g.: 1,2,3,4
 */
function save_playlist(name, songs, confirm){
    // trim playlistname
    name = $.trim(name);
    // check if playlist with same name already exists
    urlname = encodeURI(name);
    var url = "{% url laudio.views.laudio_index %}playlist/exists/" + urlname + "/";
    $.getJSON(url, function(json){
        if(json.exists === "1"){
            // if the name is the same as the current, just assume update
            // and save the playlist
            if($("#playlistName").html().trim() === name || confirm){
                // in case of normal playlist update
                var url = "{% url laudio.views.laudio_index %}playlist/save/"+urlname+"/"
                $.get(url, { songs: songs}, function(){
                    cancel_playlist();
                    $("#playlistName").html(name);
                });
            } else {
                // in case of overwriting an existing playlist
                $("#playlistRename").fadeOut("fast", function(){
                    $("#playlistConfirm th").html("Do you really want to overwrite playlist " + name+"?");
                    $("#playlistConfirm").fadeIn("fast");
                    $("#confirmYes").unbind("click");
                    $("#confirmYes").click( function(){
                       save_playlist(name, songs, true); 
                    });
                });
            }
        } else {
            // we assume this is the first save of a playlist
            var url = "{% url laudio.views.laudio_index %}playlist/save/"+urlname+"/"
            $.get(url, { songs: songs}, function(){
                cancel_playlist();
                $("#playlistName").html(name);
            });
    }
    });
}


/**
 * Fades out playlist option specific gui
 */
function cancel_playlist(){
    
    $("#playlistPlaylistMenu").toggle("slide", function(){
        $("#playlistSongMenu").toggle("slide");
    });
    
    $("#playlistList").fadeOut("fast", function(){
        $("#playlistRename").fadeOut("fast", function(){
            $("#playlistConfirm").fadeOut("fast", function(){
                $("#playlistSongs").fadeIn("slow");
            });
        });
    });
    
}

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


/**
 * Sets the context menu for the playlist
 */
function playlist_context_menu(){
    // set context menu details
    var playListMenu = [
        {
            'Play': {
                onclick: function(menuItem, menu) { 
                    play_song(this.title, this.id);
                },
                icon: "{% url laudio.views.laudio_index %}media/style/img/play_small.png",
            }
                        
        },$.contextMenu.separator, 
        {
            'Move up': {
                onclick: function(menuItem, menu) { 
                    $("#playlistSongs .selected").each( function(){
                        $(this).prev().before($(this));
                    });
                    update_line_colors("#playlistSongs");
                },
                icon: "{% url laudio.views.laudio_index %}media/style/img/up_small.png",
            }
                        
        },
        {
            'Move down': {
                onclick: function(menuItem, menu) { 
                    $($("#playlistSongs .selected").get().reverse()).each( function(){
                        $(this).next().after($(this));
                    });
                    update_line_colors("#playlistSongs");
                },
                icon: "{% url laudio.views.laudio_index %}media/style/img/down_small.png",
            }
        },
        {
            'Download': {
                onclick: function(menuItem, menu) {
                    $(".selected").each( function(){
                            var id = $(this).attr("title");
                            window.open("{% url laudio.views.laudio_index %}song_download/" + id + "/");
                    });
                },
                icon: "{% url laudio.views.laudio_index %}media/style/img/download_small.png",
            }
        },
        {
            'Remove': {
                onclick: function(menuItem, menu) {
                    $(".selected").each( function(){
                        $(this).remove();
                    });
                },
                icon: "{% url laudio.views.laudio_index %}media/style/img/remove_small.png",
            }
        },  
        $.contextMenu.separator, 
                    
        {
            'Select All': function(){
                $('#playlistSongs tbody tr').addClass("selected");
            }
        },
        {
            'Clear All': {
                onclick: function(menuItem, menu) {
                    $("#playlistSongs tbody").empty("tr");
                    $("#playlistName").html("");
                },
                icon: "{% url laudio.views.laudio_index %}media/style/img/remove_small.png",
            }
        }
    ];
    
    // bind context menu to the collection
    $(function() {
        $('#playlistSongs tbody tr').contextMenu(playListMenu,
            { 
                theme:'vista',
            }
        ); 
    });
}
