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
     * This function resets the db when you click on it
     */
    $("#resetcoll").click(function() {
        // if popup is visible do nothing
        if( $("#popup").css("display") === "block" || 
            $(".small_loading").css("display") === "block" ){
            return;
        }

        // first we unbind any previously attached events
        $("#site").unbind("click");
        $("#deleteinfo").fadeIn("slow");
        
        // execute the ajax query which deletes the db
        $("#popup").load("{% url laudio.views.ajax_drop_collection_db %}", function (){ 
            $("#deleteinfo").fadeOut("slow", function() {
                $("#popup").slideDown("slow");
            });
            
            // add a fine animation to fade out the popup
            $("#site").bind("click", function() {
                $("#popup").slideUp("slow");
            });

        });     
          
    });
    

    /**
     * When you click on scan Collection this function gets executed
     * and starts a collection scan
     */
    $("#scancoll").click(function() {
        // if popup is visible do nothing
        if( $("#popup").css("display") === "block" || 
            $(".small_loading").css("display") === "block" ){
            return;
        }
        // first we unbind any previously attached events
        $("#site").unbind("click");
        $("#scaninfo").fadeIn("slow");
        
        // delete previous values
        clear_loaded();
        
        // wait 2 secs then set db querying
        timeout = setTimeout("query_start()",2000);
        
        // execute the ajax query which scans the collection
        $("#popup").load("{% url laudio.views.ajax_scan_collection %}", function (){ 
            $("#scaninfo").fadeOut("slow", function() {
                $("#popup").slideDown("slow");
                clearTimeout(timeout);
                clearInterval( db("timer", false) );
            });
            
            
            // add a fine animation to fade out the popup
            $("#site").bind("click", function() {
                $("#popup").slideUp("slow");
            });
            
        });
        
          
   
    });

});

/*
 * Start querying the db
 */
function query_start(){
    db("timer", setInterval( "update_percentage()", 5000 ) );    
}

/*
 * Clears the loaded data
 * 
 */
function clear_loaded(){
    $("#scanned").html(0);
    $("#total").html("");
    var $canvas = $(".percentage canvas");
    var ctx = $canvas[0].getContext("2d");
    ctx.clearRect(0,0, 300 ,24);
}

/*
 * Sets the percentage of the canvas while querying the db
 * 
 */
function update_percentage(){
    // get the percentage from the db
    $.getJSON("{% url laudio.views.ajax_scan_perc %}", function(json){
        $("#scanned").html(json.scanned + "/");
        $("#total").html(json.total);
        var percent = json.scanned / json.total;
        var width = Math.floor(percent * 300);
        var $canvas = $(".percentage canvas");
        var ctx = $canvas[0].getContext("2d");
        ctx.clearRect(0,0, 300 ,24);
        // fill loaded bar
        ctx.fillStyle = "#333";
        ctx.fillRect(0,0, width ,24);
    }); 
}
