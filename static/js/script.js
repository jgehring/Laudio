/**
 * Function to change a song and update the now playing header
 *
 * @param String id:    The id of the tablerow e.g. row1
 */
function changeSong(id){
    // get play button
    var playButton = document.getElementById("playButton");
    // get previous song and set its colors to normal
    var lastSongId = document.getElementById("songId").innerHTML;
    if(document.getElementById(lastSongId) != null){
        document.getElementById(lastSongId).style.color = "";
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
    
    // update Now Playing site title
    document.getElementById("siteTitle").innerHTML = "Laudio Now Playing: " + artist + " - " + title;
    // set nice color for tr when playing but first save the existing one
    currentTr.style.backgroundColor = "#59798c";
    currentTr.style.color = "#fafafa";    

    // check if file is paused or playing, if playing first stop the song
    if (audio.paused){
        audio.src = path;
        audio.load();
        audio.play();
        playButton.innerHTML = "Pause";
    } else {
        audio.pause();
        audio.src = path;
        audio.load();
        playButton.innerHTML = "Pause";
        audio.play();
    }

}

/**
 * Function to play or stop a song
 */
function playSong(){
    var audio = document.getElementById("player");
    var playButton = document.getElementById("playButton");
    if (audio.paused){
        playButton.innerHTML = "Pause";
        audio.play();
    } else {
        audio.pause();
        playButton.innerHTML = "Play";
    }
}

/**
 * Function to play or stop a song
 */
function updatePlayPause(){
    var audio = document.getElementById("player");
    var playButton = document.getElementById("playButton");
    if (audio.paused){
        playButton.innerHTML = "Play";
    } else {
        playButton.innerHTML = "Pause";
    }
}



/**
 * Function to play the next song in line
 */
function nextSong(){
    var songId = document.getElementById("songId").innerHTML;
    // if the current tr doesnt exist in the current show library set the first 
    // row (row0) as the last played
    var currentTr = document.getElementById(songId);
    if (currentTr == null){
        currentTr = document.getElementById("row0");
    }
    if(currentTr.nextElementSibling != null){
        var nextTrId = currentTr.nextElementSibling.id;
        changeSong(nextTrId);
    }
}

/**
 * Function to play the previous song in line
 */
function prevSong(){
    var songId = document.getElementById("songId").innerHTML;
    var currentTr = document.getElementById(songId);
    if(currentTr.previousElementSibling != null && currentTr.previousElementSibling.id != "row0"){
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
    if (tr != null){
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
    while(tr.nextSibling != null){
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
    if (currentTr.previousElementSibling != null && 
        currentTr.previousElementSibling.id != "row0" &&
        direction == "up"){
        prevTr = currentTr.previousElementSibling;
        var clone1 = currentTr.cloneNode(true);
        var clone2 = prevTr.cloneNode(true);
        currentTr.parentNode.replaceChild(clone2, currentTr);
        prevTr.parentNode.replaceChild(clone1, prevTr);
        updatePlaylistClasses();
        
    } else if(currentTr.nextElementSibling != null && 
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
 * Opens the playlist
 */
function openPlaylist(){
    alert("Not implemented yet!");
}

/**
 * Saves the playlist
 */
function savePlaylist(){
    alert("Not implemented yet!");
}

/**
 * Renames the playlist
 */
function renamePlaylist(){
    alert("Not implemented yet!");
}

/**
 * Deletes the playlist
 */
function deletePlaylist(){
    alert("Not implemented yet!");
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


