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
    
    
    /**
     * toggle advanced search fields
     */
    $("#moreButton").click(function() {
        $("#advSearch").slideToggle();
    });
    
    /**
     * Toggles the playlist
     */
    $("#playlistLink").click( function(){
        $("#playlist").toggle("slide");
        $("#playlistHeader").toggle("slide");
    });
    
    /**
     * Toggles the sidebar
     */
    $("#sidebarLink").click( function(){
        $("#sidebar").toggle("slide");
        $("#sidebarHeader").toggle("slide");
    });
    
    /**
     * Opens the open playlist menu
     */
    $("#openPlaylist").click( function(){
        $("#playlistSongMenu").toggle("slide", function(){
            $("#playlistPlaylistMenu").toggle("slide");
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
            $("#playlistSongMenu").toggle("slide", function(){
                $("#playlistPlaylistMenu").toggle("slide");
                
            });
            $("#playlistSongs").fadeOut("fast", function(){
                $("#playlistSaveDialogue").fadeIn("fast");
            });
        }
    });

    /**
     * Saves a playlist
     */
    $("#savePlaylistButton").click(function(){
        var name = escape( $("#playlistSaveDialogue input").val() );
        var songs = "";
        $("#playlistSongs tr").each(function(){
            var title = $(this).attr("title");
            songs += title + ",";
        });
        songs = songs.slice(0, -1);
        save_playlist(name, songs, false);
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
     * Closes the special playlist menu
     */
    $("#cancelPlaylist").click( function(){
        cancel_playlist();
    });
    
    /**
     * Opens the delete playlist menu
     */
    $("#deletePlaylist").click( function(){
        $("#playlistSongMenu").toggle("slide", function(){
            $("#playlistPlaylistMenu").toggle("slide");
        });
        $("#playlistSongs").fadeOut("fast", function(){
            $("#playlistRemove").fadeIn("fast");
        });
    });
    
    

    
    
    /**
     * toggle alphabet search
     */
    $("#alphab li a").click(function() {
        $("#characters").slideToggle();
    });
    
    
    /**
     * When you click on a value on the sidebar it loads songs with the
     * same data you clicked on
     */
    $("#sidebar table tr").click(function(){
        var field = $(this).attr("id");
        var songId = db("playing", false);
        
        // first we get the data via db because some data is not written
        // in the sidebar how its written in the db
        $.getJSON("{% url laudio.views.laudio_index %}song_data/" + songId + "/", function(json){
            
            // then we start a search
            var args = [];
            // we need to decode html entities from the query
            args[field] = decode_html_entities(json[field]);
            search(args, "advanced");
            
        });
    });


    /**
     * loads the artist according to the letter which was clicked
     */
    $('#characters a').click(function() {
        var select = $(this).html();
        
        if (select == "All"){
            search("", "all");
        } else {
            search(select, "char");
        }
        
        $("#characters").slideToggle();
    });



    /**
     * call search after when the user entered 3 or more letters
     */
    $("#search .search").keyup(function(e) {
        if($(this).attr("value").length >= 2){
            clearTimeout( db("timer", false) );
            var value = escape( $(this).attr("value") );
            db("timer", setTimeout("search('" + value + "', 'simple')", 500) );
        }
    });
    
    
    /**
     * Hits an advanced search if the cursor is in an input field and
     * enter is being pressed
     */
    $("#advSearch input").keyup(function(e) {
        if(e.keyCode == 13) {
            var query = get_advsearch_values()
            search(query, "advanced");
        }
    });
    
    /**
     * Hits an advanced search once the search button is being clicked
     */
    $("#searchButton").click(function() {
        var query = get_advsearch_values()
        search(query, "advanced");
    });
    
    
    /***
     * TODO:
     * implement autocompletion
     */
    $("#advSearch input").each(function(){
        var inputId = $(this).attr("id");
        $(this).autocomplete(
            {
                source: function(request, response){
                    // get other variables
                    var title = encodeURIComponent($("#advSearch tr:eq(0) input").val());
                    var artist = encodeURIComponent($("#advSearch tr:eq(1) input").val());
                    var album = encodeURIComponent($("#advSearch tr:eq(2) input").val());
                    var genre = encodeURIComponent($("#advSearch tr:eq(3) input").val());
                    
                    var row = inputId.replace("search", "");
                    var url = "{% url laudio.views.laudio_index %}advautocomplete/" + row + "/";
                    url += "?title=" + title;
                    url += "&artist=" + artist;
                    url += "&album=" + album;
                    url += "&genre=" + genre;
                    
                    $.getJSON(url, function(data) {
                        response($.map(data.results, function(item) {
                                return {
                                    value: decode_html_entities(item.value)
                                };
                        }));
                    });

                },
                minLength: 3,
                select: function(event, ui) {
                    if (ui.item){
                        var val = ui.item.value;
                        $(this).attr("value", val);
                    }
            }
        })
    });
    
});



/**
 * This is a shortcut function which gets all the set values in the
 * advanced search form, forms a query string out of it, clears the 
 * values from the input fields and returns the query dictionairy
 * @return dictionairy: The query dictionairy
 */
function get_advsearch_values(){
    var title = $("#advSearch tr:eq(0) input").attr("value");
    var artist = $("#advSearch tr:eq(1) input").attr("value");
    var album = $("#advSearch tr:eq(2) input").attr("value");
    var genre = $("#advSearch tr:eq(3) input").attr("value");
    query = [];
    query["title"] = title;
    query["artist"] = artist;
    query["album"] = album;
    query["genre"] = genre;
    // then reset input fields
    $("#advSearch tr:eq(0) input").attr("value", "");
    $("#advSearch tr:eq(1) input").attr("value", "");
    $("#advSearch tr:eq(2) input").attr("value", "");
    $("#advSearch tr:eq(3) input").attr("value", "");
    
    return query;    
}
