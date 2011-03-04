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
    
    playlist_area_context_menu();
    
    /**
     * Opens the open playlist menu
     */
    $("#openPlaylist").click( function(){
        $("#playlistSongMenu").toggle("drop", function(){
            $("#playlistPlaylistMenu").toggle("drop");
        });
        $("#playlistSongs").fadeOut("fast", function(){
            // show loading
            $("#playlist .loading").fadeIn("slow");
            var url = "{% url laudio.views.list_playlists %}"
            // fetch playlist entries
            $("#playlistList tbody").load(url, function (){
                $("#playlist .loading").fadeOut('fast', function(){
                    $("#playlistSongs tbody").fadeIn('slow');
                    $("#playlistList").fadeIn("fast");
                });
            });
        });
    });

    /**
     * Opens the save playlist menu
     */
    $("#savePlaylist").click( function(){
        if( $("#playlistSongs tbody").children("tr").length > 0){
            $("#playlistSongMenu").toggle("drop", function(){
                $("#playlistPlaylistMenu").toggle("drop");
            });
            $("#playlistSongs").fadeOut("fast", function(){
                // set standardname to already running playlist
                $("#playlistSaveDialogue input").val($("#playlistName").html().trim());
                $("#playlistSaveDialogue").fadeIn("fast", function(){
                    // set focus on the input element
                    $("#playlistSaveDialogue input").focus();    
                });
            });
        }
    });

    /**
     * Saves a playlist
     */
    $("#savePlaylistButton").click(function(){
        trigger_save_playlist();
    });
    
    /**
     * Safe playlist on enter
     */
    $("#playlistSaveDialogue input").keypress(function(e){
        if(e.which == 13){
            trigger_save_playlist();
            e.preventDefault();
            return false;
        }
    });

    
    /**
     * Rename a playlist
     */
    $("#renamePlaylistButton").click(function(){
        var from = $("#playlistRename #renameName").html();
        var to = $("#playlistRename input").val();
        rename_playlist(from, to);
    });

    /**
     * Rename playlist on enter
     */
    $("#playlistRename input").keypress(function(e){
        if(e.which == 13){
            var from = $("#playlistRename #renameName").html();
            var to = $("#playlistRename input").val();
            rename_playlist(from, to);
            e.preventDefault();
            return false;
        }
    });

    /**
     * Closes the special playlist menu
     */
    $("#cancelPlaylist").click( function(){
        cancel_playlist();
    });
    
    /**
     * Opens the delete playlist menu
     */
    $("#deletePlaylist").click( function(){
        $("#playlistSongMenu").toggle("drop", function(){
            $("#playlistPlaylistMenu").toggle("drop");
        });
        $("#playlistSongs").fadeOut("fast", function(){
            $("#playlistRemove").fadeIn("fast");
        });
    });
    
    
    $("#playlistSongs tbody").sortable({
        revert: true,
        stop: function(){
            update_line_colors("#playlistSongs");
        }
    });
    
});


/**
 * Calls the save playlist function
 */
function trigger_save_playlist(){
    var name = $("#playlistSaveDialogue input").val();
    var songs = "";
    $("#playlistSongs tr").each(function(){
        var title = $(this).attr("title");
        songs += title + ",";
    });
    songs = songs.slice(0, -1);
    save_playlist(name, songs, false);
}

/**
 * Loads a playlist
 * 
 * @param integer id: the id of the playlist
 */
function load_playlist(id){
    $("#playlistPlaylistMenu").toggle("drop", function(){
        $("#playlistSongMenu").toggle("drop");
    });
    // Start eyecandy animation
    $("#playlistList").fadeOut("fast", function(){
        $("#playlistSongs").fadeOut("fast", function(){
            $("#playlist .loading").fadeIn("fast", function(){
                // and unbind previous items from context to prevent slowdown
                $("#playlistSongs tbody tr").unbind("contextmenu");
                
                set_playlist_name(id);
                
                var url = "{% url laudio.views.laudio_index %}playlist/open/" + id + "/";
                // now that we got the get url, start query
                $("#playlistSongs tbody").load(url, function (){
                    $("#playlist .loading").fadeOut('fast', function(){
                        $("#playlistSongs").fadeIn('slow');
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
            });
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
        var playlist = decode_html_entities(data);
        $("#playlistName").html(playlist);
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
 * Shows a renaming playlist dialogue
 * 
 * @param string name: name of the playlist
 */
function rename_playlist_dialogue(name){
    $("#playlistList").fadeOut("fast", function(){
        $("#playlistRename th").html("Enter a new name for playlist <span id=\"renameName\">" + name + "</span");
        $("#playlistRename input").val(name);
        $("#playlistRename").fadeIn("fast", function(){
            // set focus on the input element
            $("#playlistRename input").focus();      
        });
    });
}

/**
 * Shows a renaming playlist dialogue
 * 
 * @param string from: name of the playlist
 * @param string to: name of the future playlist
 */
function rename_playlist(from, to){
    
    fromurl = encodeURI(from);
    tourl = encodeURI(to);
    var url = "{% url laudio.views.laudio_index %}playlist/rename/" + fromurl + "/" + tourl + "/";
    
    $.getJSON(url, function(json){
        if(json.exists === "1"){
            alert("Error: Playlist wasn't renamed because the name already exists!");
        } else {
            // check if the playlist is currently playing
            if($("#playlistName").html().trim() === from){
                $("#playlistName").html(to);
            }
        }
        cancel_playlist();
    });
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
                $("#playlistSaveDialogue").fadeOut("fast", function(){
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
    
    $("#playlistPlaylistMenu").toggle("drop", function(){
        $("#playlistSongMenu").toggle("drop");
    });
    
    $("#playlistList").fadeOut("fast", function(){
        $("#playlistRename").fadeOut("fast", function(){
            $("#playlistConfirm").fadeOut("fast", function(){
                $("#playlistSaveDialogue").fadeOut("fast", function(){
                    $("#playlistSongs").fadeIn("slow");
                });
            });
        });
    });
    
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


/**
 * Sets the context menu for the playlist area
 */
function playlist_area_context_menu(){
    // set context menu details
    var playListAreaMenu = [                    
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
        $('#playlist').contextMenu(playListAreaMenu,
            { 
                theme:'vista',
            }
        ); 
    });
}

