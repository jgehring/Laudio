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
            var search = [];
            search[field] = json[field];
            search(search, "advanced");
            
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
        if($(this).attr("value").length >= 3){
            clearTimeout( db("timer", false) );
            var value = $(this).attr("value");
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
    $("#searchtitle").autocomplete(
        {
            source: function(request, response){
                // get other variables
                var title = encodeURIComponent($("#advSearch tr:eq(0) input").val());
                var artist = encodeURIComponent($("#advSearch tr:eq(1) input").val());
                var album = encodeURIComponent($("#advSearch tr:eq(2) input").val());
                var genre = encodeURIComponent($("#advSearch tr:eq(3) input").val());

                var url = "{{ URL_PREFIX }}advautocomplete/title/";
                url += "?title=" + title;
                url += "&artist=" + artist;
                url += "&album=" + album;
                url += "&genre=" + genre;
                
                $.getJSON(url, function(data) {
                    response($.map(data.results, function(item) {
                            return {
                                value: item.value
                            };
                    }));
                });

            },
            minLength: 3,
            select: function(event, ui) {
                if (ui.item){
                    $(this).attr("value", ui.item.value);
                }
        }
    });
    

    
});


/**
 * Start an advanced search
 * @param Array search:     a dictionairy containing field and value
 * @param String depth:     distincts between "advanced", "simple", "char"
 *                          and "all"
 */
function search(search, depth){
    // Start eyecandy animation
    $("#collection tbody").fadeOut('fast');
    $("#advSearch").fadeOut('fast');
    $(".loading").fadeIn("slow");
    
    if (depth === "advanced"){
        
        var queryString = "?";
        var i = 0;
        // build querystring from dictinairy
        for (field in search){
            if(i !== 0){
                queryString += "&";
            }
            queryString += field + "=" + encodeURIComponent( search[field] );
        }
        
        var url = "{% url laudio.views.laudio_index %}advsearch/" + queryString;
    
    } else if (depth === "simple"){
    
        var url = "{% url laudio.views.laudio_index %}searchall/" + search + "/";

    } else if(depth === "all"){
        
        var url = "{% url laudio.views.laudio_index %}collection/";
        
    } else if(depth === "char"){
        
        var url = "{% url laudio.views.laudio_index %}artist/" + search + "/";
        
    } else {
        
        return false;
    
    }
    
    // now that we got the get url, start query
    $("#collection tbody").load(url, function (){
        $(".loading").fadeOut('fast', function(){
            $("#collection tbody").fadeIn('slow');
                // set color to just playing song
                var lastSong = db("playing");
                
                // if we didnt just start it see if the currently played
                // song is in the collection and highlight it
                if (lastSong !== 0){
                    $( id_to_row(lastSong, true) ).addClass("playing");
                }
                
                // update table sorting
                $("#collection").trigger("update");
                
            });
        });
}

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
