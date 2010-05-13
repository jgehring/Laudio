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
     * This part is mainly for sorting the collection content
     */
     
    $(".collNr a").live("click", function() {
        if($("#collection tbody tr").length){
            $("#collection").tablesorter();
            if($(this).attr("class") == "sortup"){
                var sorting = [[0,0]];
                // FIXME: maybe we can reduce code by getting the next 4 lines
                // into some kind of function
                $("#contentHeader th a").removeClass("sortup");
                $("#contentHeader th a").removeClass("sortdown");
                $(this).removeClass("sortup");
                $(this).addClass("sortdown");
            } else {
                var sorting = [[0,1]];
                $("#contentHeader th a").removeClass("sortup");
                $("#contentHeader th a").removeClass("sortdown"); 
                $(this).removeClass("sortdown");
                $(this).addClass("sortup");
            }
            $("#collection").trigger("sorton",[sorting]); 
        }
    return false; 
    });
    $(".collTitle a").live("click", function() {
        if($("#collection tbody tr").length){
            $("#collection").tablesorter();
            if($(this).attr("class") == "sortup"){
                var sorting = [[1,0]];
                $("#contentHeader th a").removeClass("sortup");
                $("#contentHeader th a").removeClass("sortdown");
                $(this).removeClass("sortup");
                $(this).addClass("sortdown");
            } else {
                var sorting = [[1,1]];
                $("#contentHeader th a").removeClass("sortup");
                $("#contentHeader th a").removeClass("sortdown"); 
                $(this).removeClass("sortdown");
                $(this).addClass("sortup");
            } 
            $("#collection").trigger("sorton",[sorting]); 
        }
        return false; 
    });
    $(".collArtist a").live("click", function() {
        if($("#collection tbody tr").length){
            $("#collection").tablesorter();
             if($(this).attr("class") == "sortup"){
                var sorting = [[2,0]];
                $("#contentHeader th a").removeClass("sortup");
                $("#contentHeader th a").removeClass("sortdown");
                $(this).removeClass("sortup");
                $(this).addClass("sortdown");
            } else {
                var sorting = [[2,1]];
                $("#contentHeader th a").removeClass("sortup");
                $("#contentHeader th a").removeClass("sortdown"); 
                $(this).removeClass("sortdown");
                $(this).addClass("sortup");
            } 
            $("#collection").trigger("sorton",[sorting]); 
        }
        return false; 
    });
    $(".collAlbum a").live("click", function() {
        if($("#collection tbody tr").length){
            $("#collection").tablesorter();
             if($(this).attr("class") == "sortup"){
                var sorting = [[3,0]];
                $("#contentHeader th a").removeClass("sortup");
                $("#contentHeader th a").removeClass("sortdown");
                $(this).removeClass("sortup");
                $(this).addClass("sortdown");
            } else {
                var sorting = [[3,1]];
                $("#contentHeader th a").removeClass("sortup");
                $("#contentHeader th a").removeClass("sortdown"); 
                $(this).removeClass("sortdown");
                $(this).addClass("sortup");
            }  
            $("#collection").trigger("sorton",[sorting]); 
        }
        return false; 
    });
    $(".collGenre a").live("click", function() {
        if($("#collection tbody tr").length){
            $("#collection").tablesorter();
            if($(this).attr("class") == "sortup"){
                var sorting = [[4,0]];
                $("#contentHeader th a").removeClass("sortup");
                $("#contentHeader th a").removeClass("sortdown");
                $(this).removeClass("sortup");
                $(this).addClass("sortdown");
            } else {
                var sorting = [[4,1]];
                $("#contentHeader th a").removeClass("sortup");
                $("#contentHeader th a").removeClass("sortdown"); 
                $(this).removeClass("sortdown");
                $(this).addClass("sortup");
            }  
            $("#collection").trigger("sorton",[sorting]); 
        }
        return false; 
    });
    
    // set default value for last played and last selected songs
    $("body").data("playing", 0);
    $("body").data("select", 1);
    $("body").data("repeat", "norepeat");
    $("body").data("shuffle", "noshuffle");
    
    // toggle advanced search
    $("#moreButton").click(function() {
        $("#advSearch").slideToggle();
    });
    
    // toggle alphabet search
    $("#alphab li a").click(function() {
        $("#characters").slideToggle();
    });
    
    // call search at one of these events
    $("#search input").keyup(function(e) {
        //alert(e.keyCode);
        if(e.keyCode == 13) {
            search();
        }
    });
    $("#searchButton").click(function() {
        search();
    });
    
} ); 

    // search
    function search() {
        alert('Doing a search');
    };
    
