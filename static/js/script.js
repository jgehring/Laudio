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
 * Function to change a song and update the now playing header
 *
 * @param String id:    The id of the tablerow e.g. row1
 */
function changeSong(id){
    var audio = document.getElementById("player");
    // get previous song and set its colors to normal
    var lastSongId = document.getElementById("songId").innerHTML;
    if(document.getElementById(lastSongId) !== null){
        document.getElementById(lastSongId).style.backgroundColor = "";
    }
    // set id of current song
    document.getElementById("songId").innerHTML = id;
    // get current song
    var currentTr = document.getElementById(id);
    // get the data of the current song
    var tds = currentTr.children;
    var title = tds[1].innerHTML;
    var artist = tds[2].innerHTML;
    var path = tds[5].children[0].href;
    // update Now Playing site title and navigation
    document.title = artist + " - " + title;
    var nowPlaying = document.getElementById("nowPlaying");
    nowPlaying.innerHTML = "Playing: " + artist + " - " + title;
    // set nice color for tr when playing but first save the existing one
    currentTr.style.backgroundColor = "#ABC8E2";
    // check if file is paused or playing, if playing first stop the song
    if (audio.paused){
        audio.src = path;
        audio.load();
        audio.play();
    } else {
        audio.pause();
        audio.src = path;
        audio.load();
        audio.play();
    }

}

/**
 * Function to play or stop a song
 */
function playSong(){
    var audio = document.getElementById("player");
    if (audio.paused){
        audio.play();
    } else {
        audio.pause();
    }
}

/**
 * Function to play or stop a song
 */
function updatePlayPause(){
    var audio = document.getElementById("player");
    var playButton = document.getElementById("playButton");
    if (audio.paused){
        playButton.children[0].src = "/laudio/media/style/img/play.png";
    } else {
       playButton.children[0].src = "/laudio/media/style/img/pause.png";
    }
}



/**
 * Function to play the next song in line
 */
function nextSong(){
    var songId = document.getElementById("songId").innerHTML;
    var shuffle = document.getElementById("shuffle").title;
    // if the current tr doesnt exist in the current show library set the first 
    // row (row0) as the last played
    var currentTr = document.getElementById(songId);
    if (currentTr === null){
        currentTr = document.getElementById("row0");
    }
    // note that if shuffle is activated, its title is shuffleoff -> !== shuffle
    if (shuffle !== "shuffle"){
        // reduce by 1 to exclude row0 in count
        var entriesLen = currentTr.parentNode.children.length - 1;
        var randNumber = Math.floor(Math.random() * entriesLen);
        // we dont want 0 to be a result so add 1
        randNumber++;
        changeSong("row" + randNumber);
    } else if(currentTr.nextElementSibling !== null){
        var nextTrId = currentTr.nextElementSibling.id;
        changeSong(nextTrId);
    }
}

/**    // if its repeat we wont check for shuffle
 * Function to play the previous song in line
 */
function prevSong(){
    var songId = document.getElementById("songId").innerHTML;
    var currentTr = document.getElementById(songId);
    if(currentTr.previousElementSibling !== null && currentTr.previousElementSibling.id != "row0"){
        var prevTrId = currentTr.previousElementSibling.id;
        changeSong(prevTrId);
    }
}

/**
 * Appends a Song to the Playlist
 */
function addToPlaylist(id){
    // get the added songs info
    var currentTr = document.getElementById(id);
    var songId = id.replace("collrow", "");
    var tds = currentTr.children;
    var tracknumber = tds[0].innerHTML;
    var title = tds[1].innerHTML;
    var artist = tds[2].innerHTML;
    var album = tds[3].innerHTML;
    var genre = tds[4].innerHTML;
    var path = tds[5].children[0].href;
    // get the id from the counter of playlistelements    
    var playlistCounter = document.getElementById("playlistIdCounter"); 
    var playlistCounterId = playlistCounter.innerHTML;
    // manipulate playlist by adding the new entry
    var playlist = document.getElementById("playlist").children[0];
    var tr = document.createElement("tr");
    tr.id = "row" + playlistCounterId;
    tr.title = songId;
    // add the playevent on doubleclick
    tr.setAttribute('ondblclick', 'changeSong(\'' + tr.id + '\')'); 
    playlist.appendChild(tr);
    // append tds
    var tracknumberTd = document.createElement("td");
    tracknumberTd.innerHTML = tracknumber;
    tr.appendChild(tracknumberTd);
    var titleTd = document.createElement("td");
    titleTd.innerHTML = title;
    tr.appendChild(titleTd);
    var artistTd = document.createElement("td");
    artistTd.innerHTML = artist;
    tr.appendChild(artistTd);
    var albumTd = document.createElement("td");
    albumTd.innerHTML = album;
    tr.appendChild(albumTd);
    var genreTd = document.createElement("td");
    genreTd.innerHTML = genre;
    tr.appendChild(genreTd);    
    var linkTd = document.createElement("td");
    tr.appendChild(linkTd);    
    var link = document.createElement("a");
    link.href = path;
    link.innerHTML = "Download";
    linkTd.appendChild(link);
    var upTd = document.createElement("td");
    upTd.setAttribute('onclick', 'songPosPlaylist(\'' + tr.id + '\', \'up\')');
    upTd.className = "songUpPlaylist"; 
    tr.appendChild(upTd);
    var downTd = document.createElement("td");
    downTd.setAttribute('onclick', 'songPosPlaylist(\'' + tr.id + '\', \'down\')');
    downTd.className = "songDownPlaylist"; 
    tr.appendChild(downTd);
    var delTd = document.createElement("td");
    delTd.setAttribute('onclick', 'rmFromPlaylist(\'' + tr.id + '\')');
    delTd.className = "rmFromPlaylist"; 
    tr.appendChild(delTd);
    // increment the id and set the classes for the trs
    playlistCounter.innerHTML = parseInt(playlistCounter.innerHTML) + 1;
    updatePlaylistClasses();
}

/**
 * Adds the alternating bg to the playlist by alternating the classes
 */
function updatePlaylistClasses(){
    var playlist = document.getElementById("playlist");
    var trs = playlist.children[0].children;
    for (var i=1; i<trs.length; i++){
        if(i % 2){
            trs[i].className = "line1";
        } else {
            trs[i].className = "line2";
        }
    }
}

/**
 * Removes an item from the playlist
 */
function rmFromPlaylist(id){
    tr = document.getElementById(id);
    currentSong = document.getElementById("songId");
    if (id == currentSong.innerHTML){
        alert("Cant remove currently playing song from playlist!");
    } else {
        tr.parentNode.removeChild(tr);
        updatePlaylistClasses()
    }
}

/**
 * Plays the playlist
 */
function playPlaylist(){
    tr = document.getElementById("row0").nextElementSibling;
    if (tr !== null){
        changeSong(tr.id);
    }
}

/**
 * Clears all elemeents off the playlist
 */
function clearPlaylist(){
    tr = document.getElementById("row0");
    // reset playlist counter
    var counter = document.getElementById("playlistIdCounter");
    counter.innerHTML = 1;
    $("#songId").html("row0");
    while(tr.nextSibling !== null){
        rmTr = tr.nextElementSibling;
        rmTr.parentNode.removeChild(rmTr);
    }
    
}

/**
 * Move Song up or down the Playlist
 */
function songPosPlaylist(id, direction){
    var currentTr = document.getElementById(id);
    // check if we can move up or down
    if (currentTr.previousElementSibling !== null && 
        currentTr.previousElementSibling.id != "row0" &&
        direction == "up"){
        prevTr = currentTr.previousElementSibling;
        var clone1 = currentTr.cloneNode(true);
        var clone2 = prevTr.cloneNode(true);
        currentTr.parentNode.replaceChild(clone2, currentTr);
        prevTr.parentNode.replaceChild(clone1, prevTr);
        updatePlaylistClasses();
        
    } else if(currentTr.nextElementSibling !== null && 
              currentTr.nextElementSibling != "row0" &&
              direction == "down") {
        nextTr = currentTr.nextElementSibling;
        var clone1 = currentTr.cloneNode(true);
        var clone2 = nextTr.cloneNode(true);
        currentTr.parentNode.replaceChild(clone2, currentTr);
        nextTr.parentNode.replaceChild(clone1, nextTr);
        updatePlaylistClasses();    
        
    }
}

/**
 * Ask for a confirmation and then proceed to the url
 *
 * @param String url:   The url where it should go if ok
 * @param String msg:   The message which should be displayed when asking for
 *                      for confirmation
 */
function confirmAction(msg, url){
    var conf = confirm(msg);
    if (conf){
        self.location.href = url;
    }
}

/**
 * Check if repeat is enabled and set the next song according to this
 *
 */
function checkShuffleRepeat(){
    var repeat = document.getElementById("repeat").title;
    // note that if repeat is activated, its title is repeatall -> === repeatall
    if (repeat === "repeat"){
        nextSong();
    } else if (repeat === "repeatall") {
        var audio = document.getElementById("player");
        audio.play();
    } else if (repeat === "repeatoff"){
        var songId = document.getElementById("songId").innerHTML;
        // if the current tr is the last one and repeat all is activated, play
        // the first song as the next song
        var currentTr = document.getElementById(songId);
        if (currentTr.nextElementSibling === null){
            var firstId = currentTr.parentNode.children[1].id;
            changeSong(firstId);
        } else {
            nextSong();
        }
    }
}

/**
 * Set shuffle on or off
 *
 */
function setShuffle(){
    var shuffle = document.getElementById("shuffle");
    // note that if shuffle is activated, its title is shuffleoff
    if (shuffle.title === "shuffle"){
        shuffle.title = "shuffleoff";
        shuffle.alt = "shuffleoff";
        shuffle.src = "/laudio/media/style/img/shuffle.png";
    } else {
        shuffle.title = "shuffle";
        shuffle.alt = "shuffle";
        shuffle.src = "/laudio/media/style/img/shuffleoff.png";
    }
}

/**
 * Set repeat on or off
 *
 */
function setRepeat(){
    var repeat = document.getElementById("repeat");
    // note that if repeat is activated, its title is repeatall
    if (repeat.title === "repeat"){
        repeat.title = "repeatall";
        repeat.alt = "repeatall";
        repeat.src = "/laudio/media/style/img/repeat.png";
    } else if (repeat.title === "repeatall"){
        repeat.title = "repeatoff";
        repeat.alt = "repeatoff";
        repeat.src = "/laudio/media/style/img/repeatall.png";
    } else {
        repeat.title = "repeat";
        repeat.alt = "repeat";
        repeat.src = "/laudio/media/style/img/repeatoff.png";
    }
}

/**
 * Jumps to a certain song according to id
 *
 */
function jumpToSong(){
    id = document.getElementById("songId").innerHTML;
    window.location.hash = id;
    window.scrollBy(0,-30);
}
