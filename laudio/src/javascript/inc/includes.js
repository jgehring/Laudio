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
 * This file defines usefull scripts which are often used on all sites
 */


/**
 * This is basically a shortcut for the jquery store function
 * @param String key:   The value of the key under which we store and 
 *                      retrieve the values
 * 
 * @param value:        If given we save a new value
 * @return:             The value we wanted or Null if we stored a value
 */
function db(key, value) {
    if(value === false){
        return $("body").data(key);
    } else {
        $("body").data(key, value);
        return null;
    }
}

/**
 * Converts a song id to the tr id, e.g. 1 to row1
 * @param Integer id:   The songid
 * @param Boolean hash: If true a # is written before the row
 * 
 * @return:             The id for the row
 */
function id_to_row(id, hash){
    if(hash){
        return "#row" + id;
    } else {
        return "row" + id;
    }
}


/**
 * Same as id_to_row except the other way round, e.g. row1 to 1
 * @param Integer id:   The rowid
 * 
 * @return:             The songid
 */
function row_to_id(row){
    return row.replace("row", "");
}

/**
 * Decodes HTML Entities
 * @param string str: string which you want to decode
 * @return string: the decoded string
 */
function decode_html_entities(str) {
    var text=content.document.createElement('textarea'); 
    text.innerHTML = str;
    return text.value;
    text.parentNode.removeChild(text);
}

