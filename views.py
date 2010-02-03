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
from laudio.classes.musicindexer import MusicIndexer
from laudio.models import Song, Playlist
from django.db.models import Q
from django.conf import settings
from django.http import HttpResponseForbidden
from django.utils.datastructures import MultiValueDictKeyError
import os

# this is the site for the collection tab
def index(request):
    # check for needed libraries
    try:
        import lxml, mutagen, sqlite3
    except ImportError:
        msg = ("Cannot run program correctly, one of the required libraries: \
                lxml, mutagen or sqlite is missing!")
        return render_to_response('error.html', {'msg': msg,})
    # get songs from db
    songs = Song.objects.all().extra(select=
    {'lartist': 'lower(artist)', 'lalbum': 'lower(album)', 'ltrnr': 'tracknumber',}
    ).order_by('lartist', "lalbum", "ltrnr")[:1]
    # generate the letters and numbers for the artists selection
    letters = map(chr, range(97, 123))
    for i in xrange(0,10):
        letters.append(i)
    if songs:
        firstsong = songs[0].path
    else:
        firstsong = ""
        
    return render_to_response('index.html', {'firstsong': firstsong, 'letters': letters})


# this is the site for the playlist tab    
def playlist(request):
    # get songs from db
    songs = Song.objects.all().extra(select=
    {'lartist': 'lower(artist)', 'lalbum': 'lower(album)', 'ltrnr': 'tracknumber',}
    ).order_by('lartist', "lalbum", "ltrnr")[:1]
    # generate the letters and numbers for the artists selection
    letters = map(chr, range(97, 123))
    for i in xrange(0,10):
        letters.append(i)
    if songs:
        firstsong = songs[0].path
    else:
        firstsong = ""
    return render_to_response('playlist.html', {'firstsong': firstsong, 'letters': letters})    

"""
    START getting data via jquery
    This basically loads the data rows for the jquery requests
"""
def slim_collection(request, artist, playlist=False):
    # get selected artist and songs from db
    songs = Song.objects.filter(artist__istartswith=artist).extra(select=
    {'lartist': 'lower(artist)', 'lalbum': 'lower(album)', 'ltrnr': 'tracknumber',}
    ).order_by('lartist', "lalbum", "ltrnr")
    # return html data for jquery
    return render_to_response('songs.html', {'songs': songs, 'playlist': playlist})

def whole_collection(request, playlist=False):
    # get selected artist and songs from db
    songs = Song.objects.all().extra(select=
    {'lartist': 'lower(artist)', 'lalbum': 'lower(album)', 'ltrnr': 'tracknumber',}
    ).order_by('lartist', "lalbum", "ltrnr")
    # return html data for jquery
    return render_to_response('songs.html', {'songs': songs, 'playlist': playlist})

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
    return render_to_response('songs.html', {'songs': songs, 'playlist': playlist})   

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
    return render_to_response('songs.html', {'songs': songs, 'playlist': playlist})   
"""
    END getting data via jquery
"""


def about(request):
    return render_to_response('about.html', {})


def friends(request):
    return render_to_response('friends.html', {})

def search(request):
    return render_to_response('search.html', {})


def laudio_settings(request):
    msg = ""
    # get ip and check if it is localhost
    # only localhost can set the path
    ip = request.META.get('REMOTE_ADDR')
    if ip != "127.0.0.1":
        return HttpResponseForbidden()
    
    # get the symlink of the music collection if it exists
    collSymlink = os.path.join(os.path.dirname(__file__), 'static/audio').replace('\\', '/')
    if os.path.exists(collSymlink):
        collection = os.readlink(collSymlink)
    else:
        collection = ""
    # if collection is being passed via get set the symlink
    try:
        # get the collection
        collPath = request.GET["collection"]
        # if the given path exists add a symlink
        if os.path.exists(collPath):
            # if there is already a symlink remove it first
            if os.path.exists(collSymlink):
                os.unlink(collSymlink)
            os.symlink( collPath, os.path.join(os.path.dirname(__file__), 'static/audio').replace('\\', '/') )
            collection = collPath
            msg += " Musiclibrarypath set to <b>%s</b>!<br/>" % (collPath)
    except MultiValueDictKeyError:
        pass

    # if all data should be dropped
    try:
        drop = request.GET["drop"]
        if drop:
            Song.objects.all().delete()
            Playlist.objects.all().delete()
            msg += "Delete all files and playlists!<br/>"
    except MultiValueDictKeyError:
        pass
    
    # if scan should be made
    try:
        scan = request.GET["scan"]
        if scan:
            indexer = MusicIndexer( os.path.join(os.path.dirname(__file__), 'static/audio/').replace('\\', '/') )
            indexer.scan()
            msg += "Scanned <b>%i</b> files, updated <b>%i</b> files and added <b>%i</b> songs \
                    to the library!<br/>" % ( indexer.scanned, indexer.modified, indexer.added )
    except MultiValueDictKeyError:
        pass
        
    return render_to_response( 'settings.html', {"collection": collection, "msg": msg} )

    

