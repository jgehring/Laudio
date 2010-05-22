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
    $("#resetcoll").click(function() {
        $("#popup").fadeIn("slow");
        $("#popup").addClass("loading");
        $("#popup").load("/laudio/settings/resetdb/", function (){ 
            $("#popup").removeClass("loading");
            $("#popup p").fadeIn("slow");
        });       
    });
    
    $("#popup").click(function() {
       $(this).fadeOut("fast");
    });
    
    $("#scancoll").click(function() {
       $("#popup").fadeIn("slow");
        $("#popup").addClass("loading");
        $("#popup").load("/laudio/settings/scan/", function (){ 
            $("#popup").removeClass("loading");
            $("#popup p").fadeIn("slow");
        });   
    });
    
} );
