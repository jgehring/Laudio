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
     * loads the artist according to the letter which was clicked
     */
    $('#characters a').click(function() {
        $("#contentHeader th a").removeClass("sortup");
        $("#contentHeader th a").removeClass("sortdown");
        $("#collection tbody").fadeOut('fast');
        $('#characters').fadeOut("slow");
        $(".loading").fadeIn("fast");
        var content_show = $(this).html();
        if (content_show == "All"){
            $("#collection tbody").load("{{ URL_PREFIX }}collection/", function (){ 
                $(".loading").fadeOut('fast', function(){
                    $("#collection tbody").fadeIn('fast');
                    // set color to just playing song
                    var lastSong = $("body").data("playing");
                    if (lastSong !== 0){
                        $("#row" + lastSong).addClass("playing");
                    }
                    // update table sorting
                    $("#collection").trigger("update");
                });
            });            
        } else {
            $("#collection tbody").load("{{ URL_PREFIX }}artist/" + content_show + "/", function (){ 
                $(".loading").fadeOut('fast', function(){
                    $("#collection tbody").fadeIn('fast');
                    // set color to just playing song
                    var lastSong = $("body").data("playing");
                    if (lastSong !== 0){
                        $("#row" + lastSong).addClass("playing");
                    }
                    // update table sorting
                    $("#collection").trigger("update");
                });
            });
        }
        
    });

    /**
     * click on the progressbar to change the part
     */

    // toggle advanced search
    $("#moreButton").click(function() {
        $("#advSearch").slideToggle();
    });
    
    // toggle alphabet search
    $("#alphab li a").click(function() {
        $("#characters").slideToggle();
    });
    
    // call search after when the user entered 3 or more letters
    $("#search .search").keyup(function(e) {
        if($(this).attr("value").length >= 3){
            clearTimeout($("body").data("timer"));
            $("body").data("timer", setTimeout("search(true)", 500) )
        }
    });
    
    $("#advSearch input").keyup(function(e) {
        if(e.keyCode == 13) {
            search(false);
        }
    });
    $("#searchButton").click(function() {
        search(false);
    });
    
    
    /***
     * TODO:
     * write the 4 functions into 1
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
    
    $("#searchartist").autocomplete(
        {
            source: function(request, response){
                // get other variables
                var title = encodeURIComponent($("#advSearch tr:eq(0) input").val());
                var artist = encodeURIComponent($("#advSearch tr:eq(1) input").val());
                var album = encodeURIComponent($("#advSearch tr:eq(2) input").val());
                var genre = encodeURIComponent($("#advSearch tr:eq(3) input").val());

                var url = "{{ URL_PREFIX }}advautocomplete/artist/";
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
    
    $("#searchalbum").autocomplete(
        {
            source: function(request, response){
                // get other variables
                var title = encodeURIComponent($("#advSearch tr:eq(0) input").val());
                var artist = encodeURIComponent($("#advSearch tr:eq(1) input").val());
                var album = encodeURIComponent($("#advSearch tr:eq(2) input").val());
                var genre = encodeURIComponent($("#advSearch tr:eq(3) input").val());

                var url = "{{ URL_PREFIX }}advautocomplete/album/";
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
    
    $("#searchgenre").autocomplete(
        {
            source: function(request, response){
                // get other variables
                var title = encodeURIComponent($("#advSearch tr:eq(0) input").val());
                var artist = encodeURIComponent($("#advSearch tr:eq(1) input").val());
                var album = encodeURIComponent($("#advSearch tr:eq(2) input").val());
                var genre = encodeURIComponent($("#advSearch tr:eq(3) input").val());

                var url = "{{ URL_PREFIX }}advautocomplete/genre/";
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


/*
 * Does and advanced or simple search
 * @param boolean simple:   if true, just look up the value from the 
 *                          simple searchfield, else check the 4 advanced
 *                          ones
 * 
 */
function search(simple) {
    $("#contentHeader th a").removeClass("sortup");
    $("#contentHeader th a").removeClass("sortdown");
    var all = $("#search input").attr("value");
    var title = encodeURIComponent($("#advSearch tr:eq(0) input").attr("value"));
    var artist = encodeURIComponent($("#advSearch tr:eq(1) input").attr("value"));
    var album = encodeURIComponent($("#advSearch tr:eq(2) input").attr("value"));
    var genre = encodeURIComponent($("#advSearch tr:eq(3) input").attr("value"));
    
    // check if advanced search contains input
    if((title || artist || album || genre) && !simple){
        $("#collection tbody").fadeOut('fast');
        $("#advSearch").fadeOut('fast');
        $(".loading").fadeIn("slow");
        var url =  "{{ URL_PREFIX }}advsearch/";
        // FIXME: maybe set this as data instead of url, wouldnt be much
        // shorter though
        var query = "?artist=" + artist + "&amp;title=" + title +
                    "&amp;genre=" + genre + "&amp;album=" + album;
        $("#collection tbody").load(url + query, function (){
            $(".loading").fadeOut('fast', function(){
                $("#collection tbody").fadeIn('slow');
                // set color to just playing song
                var lastSong = $("body").data("playing");
                if (lastSong !== 0){
                    $("#row" + lastSong).addClass("playing");
                }
                // update table sorting
                $("#collection").trigger("update");
                
                // reset input fields
                $("#advSearch tr:eq(0) input").attr("value", "");
                $("#advSearch tr:eq(1) input").attr("value", "");
                $("#advSearch tr:eq(2) input").attr("value", "");
                $("#advSearch tr:eq(3) input").attr("value", "");
            });
        });
           
           
    } else if (all) {
        $("#collection tbody").fadeOut('fast');
        $("#advSearch").fadeOut('fast');
        $(".loading").fadeIn("slow");
        var searchValue = encodeURIComponent($('.search').attr("value"));
        $("#collection tbody").load( "{{ URL_PREFIX }}searchall/" + searchValue + "/", function() {
            $(".loading").fadeOut('fast');
            $("#collection tbody").fadeIn('slow');
            // set color to just playing song
            var lastSong = $("body").data("playing");
            if (lastSong !== 0){
                $("#row" + lastSong).addClass("playing");
            }
            // update table sorting
            $("#collection").trigger("update");
            // reset input fields
                $("#advSearch tr:eq(0) input").attr("value", "");
                $("#advSearch tr:eq(1) input").attr("value", "");
                $("#advSearch tr:eq(2) input").attr("value", "");
                $("#advSearch tr:eq(3) input").attr("value", "");
        });
    } else {
        return false;
    }
};
