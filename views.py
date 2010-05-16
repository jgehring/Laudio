#!/usr/bin/env python
#-*- coding:utf-8 -*-
"""
Laudio - A webbased musicplayer

Copyright (C) 2010 Bernhard Posselt, bernhard.posselt@gmx.at

Laudio is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 3 of the License, or
(at your option) any later version.

Laudio is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA

"""

from django.shortcuts import render_to_response
from laudio.musicindexer import MusicIndexer
from laudio.models import Song, Playlist, PlaylistEntry
# django
from django.db.models import Q
from django.conf import settings
from django.utils.datastructures import MultiValueDictKeyError
from django.conf import settings
from django.http import HttpResponse
# other python libs
import time
import os
import urllib2



# this is the site for the collection tab
def index(request):
    # get first song from db so we can set src of the audio element
    songs = Song.objects.all().extra(select=
    {'lartist': 'lower(artist)', 'lalbum': 'lower(album)', 'ltrnr': 'tracknumber',}
    ).order_by('lartist', "lalbum", "ltrnr")[:1]
    if songs:
        firstsong = songs[0].path
    else:
        firstsong = ""
    return render_to_response('index.html', { 'firstsong': firstsong })



# this is the site for the playlist tab    
def playlist(request):
    # get first song from db so we can set src of the audio element
    songs = Song.objects.all().extra(select=
    {'lartist': 'lower(artist)', 'lalbum': 'lower(album)', 'ltrnr': 'tracknumber',}
    ).order_by('lartist', "lalbum", "ltrnr")[:1]
    if songs:
        firstsong = songs[0].path
    else:
        firstsong = ""
    return render_to_response('playlist.html', { 'firstsong': firstsong })    



# ajax requests
def song_data(request, id):
    song = Song.objects.get(id=id)
    return render_to_response('requests/song_data.html', {"song": song})
    
def cover_fetch(request, id):
    song = Song.objects.get(id=id)
    # set default cover path
    cover = "/laudio/media/style/img/nocover.png"
    # get collection path
    collSymlink = os.path.join( os.path.dirname(__file__),
                                    'media/audio').replace('\\', '/' )
    collPath = os.readlink(collSymlink)
    # get the dirname joined with the collection path and 
    # look if theres a png or jpeg in it
    songPath = os.path.dirname(song.path)
    path = os.path.join(collPath, songPath)
    for file in os.listdir(path):
        if file.lower().endswith(".jpg") or file.lower().endswith(".jpeg") or file.lower().endswith(".png"):
            # check for folder.jpg or cover.jpg which is very common
            if file.lower() == "folder.jpg" or file.lower() == "cover.jpg":
                cover = file
                break
            cover = file
    # now that we got the file get the coverpath
    coverPath = os.path.join("/laudio/media/audio", os.path.join(songPath, cover))
    return render_to_response('requests/cover.html', {"coverpath": coverPath})

def slim_collection(request, artist, playlist=False):
    # get selected artist and songs from db
    songs = Song.objects.filter(artist__istartswith=artist).extra(select=
    {'lartist': 'lower(artist)', 'lalbum': 'lower(album)', 'ltrnr': 'tracknumber',}
    ).order_by('lartist', "lalbum", "ltrnr")
    # return html data for jquery
    return render_to_response('requests/songs.html', {'songs': songs,
                                             'playlistCollection': playlist,
                                             'playlist':False})


def whole_collection(request, playlist=False):
    # get selected artist and songs from db
    songs = Song.objects.all().extra(select=
    {'lartist': 'lower(artist)', 'lalbum': 'lower(album)', 'ltrnr': 'tracknumber',}
    ).order_by('lartist', "lalbum", "ltrnr")
    # return html data for jquery
    return render_to_response('requests/songs.html', {'songs': songs,
                              'playlistCollection': playlist, 'playlist':False})


def search_collection(request, search, playlist=False):
    # FIXME:    seperate keywords by space and check db for each element
    #           current setup only retrieves a result when one row matches the search
    #           the search should also match if the parts of the search var appear
    #           in different rows

    # get song where any field matches the search
    songs = Song.objects.filter(
        Q(title__contains=search)|
        Q(artist__contains=search)|
        Q(album__contains=search)|
        Q(genre__contains=search)
    ).extra(select=
            {'lartist': 'lower(artist)', 'lalbum': 'lower(album)', 'ltrnr': 'tracknumber',}
            ).order_by('lartist', "lalbum", "ltrnr")
    return render_to_response('requests/songs.html', {'songs': songs,
                              'playlistCollection': playlist, 'playlist':False})


def adv_search(request, playlist=False):
    title = request.GET["title"]
    artist = request.GET["artist"]
    album = request.GET["album"]
    genre = request.GET["genre"]
    # get song where any field matches the search
    songs = Song.objects.filter(title__contains=title,
                                artist__contains=artist,
                                album__contains=album,
                                genre__contains=genre
    ).extra(select=
        {'lartist': 'lower(artist)', 'lalbum': 'lower(album)', 'ltrnr': 'tracknumber',}
        ).order_by('lartist', "lalbum", "ltrnr")
    return render_to_response('requests/songs.html', {'songs': songs,
                              'playlistCollection': playlist, 'playlist':False})




"""
START playlist requests
"""
def save_playlist(request):
    # check if any elements were passed at all
    playlistName = urllib2.unquote(request.GET["playlistname"])
    playlistItems = request.GET["urls"].split(".")
    # look up if a playlist with the name exists already, if so delete it
    try:
        pl = Playlist.objects.get(name=playlistName)
        pl.delete()
    except Playlist.DoesNotExist:
        pass
    pl = Playlist(name=playlistName, added= int( time.time() ))
    pl.save()
    songs = []
    for number in playlistItems:
        try:
            sg = Song.objects.get(id=number)
            pe = PlaylistEntry(song=sg, playlist=pl)
            pe.save()
        except Song.DoesNotExist:
            pass
    return render_to_response('empty.html', {})

def open_playlist(request, playlistName):
    playlistName = urllib2.unquote(playlistName)
    playlist = Playlist.objects.get(name=playlistName)
    songs = playlist.songs.all()
    return render_to_response('requests/songs.html', {'songs': songs, 'playlist': True})

def delete_playlist(request, playlistName):
    playlistName = urllib2.unquote(playlistName)
    playlist = Playlist.objects.get(name=playlistName).delete()
    return render_to_response('requests/empty.html', {})

def rename_playlist(request, oldName, newName):
    playlist = Playlist.objects.get(name=urllib2.unquote(oldName))
    playlist.name = urllib2.unquote(newName)
    playlist.save()
    return render_to_response('requests/empty.html', {})

def list_playlists(request):
    playlists = Playlist.objects.all()
    return render_to_response('list_playlists.html', {'playlists': playlists})
"""
END playlist requests
"""

def about(request):
    return render_to_response('about.html', {})

def search(request):
    return render_to_response('search.html', {})


def laudio_settings(request):
    msg = []
    # get ip and check if it is localhost
    # only localhost can access settings (for now)
    ip = request.META.get('REMOTE_ADDR')
    if ip != "127.0.0.1":
        return render_to_response('403.html', {})

    # get the symlink of the music collection if it exists
    collSymlink = os.path.join( os.path.dirname(__file__),
                                            'media/audio').replace('\\', '/' )
    if os.path.exists(collSymlink):
        collection = os.readlink(collSymlink)
    else:
        collection = ""

    # if collection is being passed via get set the symlink
    try:
        collPath = request.GET["collection"]
        # split the path and check the rights for each folder
        checkPath = collPath.split("/")
        chPath = ""
        for path in checkPath:
            # if path is empty; concerns the first and last slash
            if not path:
                continue
            path = "/" + path
            chPath += path
            # check for path existence and access rights
            if not os.access(chPath, os.F_OK):
                raise OSError("Path %s does not exist!" % chPath)
            if not os.access(chPath, os.X_OK):
                raise OSError("No access rights for %s!<br /> Use: <b>sudo chmod a+x %s</b>" % (chPath, chPath))
        # now check if we got read rights on the music folder, we could do this
        # recursive to check every folder but that would waste too mucht time
        if not os.access(collPath, os.R_OK):
            raise OSError("Music collection is not readable!<br /> Use: <b>sudo chmod \
                           -R 0755 %s</b>" % (collPath))
        # check if we can set a symlink and access the db
        staticPath = os.path.join( os.path.dirname(__file__),
                                            'media').replace('\\', '/' )
        if not os.access(staticPath, os.W_OK):
            raise OSError("No write Access in static directory!<br /> \
                            Use: <b>sudo chmod -R 0777 %s</b>" % (staticPath))
        # if the given path exists and add a symlink
        try:
            os.unlink(collSymlink)
        except OSError:
            pass
        os.symlink( collPath, collSymlink )
        collection = collPath
        msg.append( "Musiclibrarypath set to <b>%s</b>!" % (collPath) )
    except MultiValueDictKeyError:
        pass
    except OSError as e:
        msg.append(e)

    # if all data should be dropped
    try:
        drop = request.GET["drop"]
        if drop:
            Song.objects.all().delete()
            Playlist.objects.all().delete()
            msg.append( "Delete all files and playlists in the db!" )
    except MultiValueDictKeyError:
        pass

    # if scan should be made
    indexer = MusicIndexer( os.path.join(os.path.dirname(__file__),
                                        'media/audio/').replace('\\', '/') )
    try:
        scan = request.GET["scan"]
        dbPath = settings.DATABASE_NAME
        if not os.access(dbPath, os.W_OK):
            raise OSError("No write access to database!<br /> \
                            Use: <b>sudo chmod 0775 %s</b>" % (dbPath))
        if scan:
            indexer.scan()
            msg.append( "Scanned <b>%i</b> files, updated <b>%i</b> files and \
                         added <b>%i</b> songs to the library!"
                         % (indexer.scanned, indexer.modified, indexer.added) )
    except MultiValueDictKeyError:
        pass
    except OSError as e:
        msg.append(e)

    return render_to_response( 'settings.html', {"collection": collection,
                               'msg': msg, 'broken': indexer.broken, 
                               'noRights': indexer.noRights} )


# interface for ampache xml
def ampache_api(request):
    method = request.GET["action"]

    # action for handshake, required for connecting
    if method == "handshake":
        # TODO: build in authentication
        """ README: all these values are filled with dummy code because
            auth will be built in later"""
        user = request.GET["user"]
        passwd = request.GET["auth"]
        timestamp = request.GET["timestamp"]
        auth_token = "foobar"
        version = "3.6"
        last_update = "2010-02-06T21:00Z"
        last_add = "2010-02-06T21:00Z"
        last_clean = "2010-02-06T21:00Z"
        nr_songs = 500
        nr_artists = 500
        nr_albums = 500
        nr_tags = 0
        nr_videos = 0
        
        handshake = { "auth_token" : auth_token,
                      "api_version" : version,
                      "last_update" : last_update,
                      "last_add" : last_add,
                      "last_clean" : last_clean,
                      "nr_songs" : nr_songs,
                      "nr_artists" : nr_artists,
                      "nr_tags" : nr_tags,
                      "nr_albums" : nr_albums,
                      "nr_videos" : nr_videos}

        return render_to_response('ampache/handshake.xml', handshake)


    
