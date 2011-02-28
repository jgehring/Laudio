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
            
            queryString += field + "=" + encodeURIComponent(search[field]);
            i++;
        }
        
        var url = "{% url laudio.views.ajax_adv_search_collection %}" + queryString;
    
    } else if (depth === "simple"){
    
        var url = "{% url laudio.views.laudio_index %}searchall/" + search + "/";

    } else if(depth === "all"){
        
        var url = "{% url laudio.views.ajax_whole_collection %}";
        
    } else if(depth === "char"){
        
        var url = "{% url laudio.views.laudio_index %}artist/" + search + "/";
        
    } else {
        
        return false;
    
    }
    
    
    // and unbind previous items from context to prevent slowdown
    $('#collection tbody tr').unbind('contextmenu');
    
    // now that we got the get url, start query
    $("#collection tbody").load(url, function (){
        $(".loading").fadeOut('fast', function(){
            $("#collection tbody").fadeIn('slow');
                // set color to just playing song
                var lastSong = db("playing", false);
                
                // if we didnt just start it see if the currently played
                // song is in the collection and highlight it
                if (lastSong !== 0 && db("playlist", false) === 0){
                    $( id_to_row(lastSong, true) ).addClass("playing");
                }
                
                // update table sorting
                $("#collection").trigger("update");
                
                // update context menu
                collection_context_menu();
                
            });
        });
}
