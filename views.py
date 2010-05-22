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

# laudio modules
from laudio.src.coverfetcher import CoverFetcher
from laudio.src.laudiosettings import LaudioSettings
from laudio.models import *
from laudio.forms import *
# django
from django.shortcuts import render_to_response
from django.db.models import Q
from django.conf import settings
from django.utils.datastructures import MultiValueDictKeyError
from django.conf import settings
from django.http import HttpResponse
from django.http import HttpResponseRedirect
from django.contrib.auth.models import User
# other python libs
import time
import os


########################################################################
# Visible Sites                                                        #
########################################################################
def index(request):
    """The collection view which is displayed as index by default
    Returns one song which we have to set for the audio element in order
    to work properly"""
    song = Song.objects.all()[:1]
    if song:
        firstsong = song[0].path
    else:
        firstsong = ""
    return render_to_response('index.html', { 'firstsong': firstsong })


def about(request):
    """A plain about site"""
    return render_to_response('about.html', {})


def laudio_settings(request):
    """Site where the configuration happens"""
    config = LaudioSettings()
    users = User.objects.all()
    if request.method == 'POST':
        settingsForm = SettingsForm(request.POST)
        if settingsForm.is_valid(): 
            collection = settingsForm.cleaned_data['collection']
            requireLogin = settingsForm.cleaned_data['requireLogin']
            # get the first setting in the db
            try:
                settings = Settings.objects.get(pk=1)
            except Settings.DoesNotExist:
                settings = Settings()
            settings.collection = collection
            settings.requireLogin = requireLogin
            settings.save()
            # set symlink
            config.setCollectionPath(collection)
    else:
        try:
            settings = Settings.objects.get(pk=1)
            settingsForm = SettingsForm(instance=settings)
        except Settings.DoesNotExist:
            settingsForm = SettingsForm(settings)
    return render_to_response( 'settings.html', { 
                                "collection": config.collectionPath,  
                                "settingsForm": settingsForm,
                                "users": users 
                                }
                            )
                            
    
def laudio_settings_new_user(request):
    
    if request.method == 'POST':
        userform = UserForm(request.POST)
        profileform = UserProfileForm(request.POST)
        
        if userform.is_valid() and profileform.is_valid(): 
            user = User(username=userform.cleaned_data['username'],
                        password=userform.cleaned_data['password'],
                        email=userform.cleaned_data['email'],
                        is_superuser=userform.cleaned_data['is_superuser'],
                        is_active=userform.cleaned_data['is_active'])
            user.save()
            # profile
            profile = UserProfile(user=user,
                                  lastFMName=profileform.cleaned_data['lastFMName'],
                                  lastFMPass=profileform.cleaned_data['lastFMPass'],
                                  lastFMSubmit=profileform.cleaned_data['lastFMSubmit'])
            profile.save()
            return HttpResponseRedirect(settings.URL_PREFIX + 'settings/')
    else:
        userform = UserForm()
        profileform = UserProfileForm()

    return render_to_response( 'newuser.html', { 
                                "userform": userform,  
                                "profileform": profileform,
                                }
                            )


def laudio_settings_edit_user(request, userid):
    """Edit a user by userid"""
    if request.method == 'POST':
        
        userform = UserForm(request.POST)
        profileform = UserProfileForm(request.POST)
        
        if userform.is_valid() and profileform.is_valid(): 
            user = User.objects.get(pk=userid)
            user.username = userform.cleaned_data['username']
            user.password = userform.cleaned_data['password']
            user.email = userform.cleaned_data['email']
            user.is_superuser = userform.cleaned_data['is_superuser']
            user.is_active = userform.cleaned_data['is_active']
            user.save()
            # profile
            profile = UserProfile.objects.get(user=user)
            profile.user = user
            profile.lastFMName = profileform.cleaned_data['lastFMName']
            profile.lastFMPass = profileform.cleaned_data['lastFMPass']
            profile.lastFMSubmit = profileform.cleaned_data['lastFMSubmit']
            profile.save()
            return HttpResponseRedirect(settings.URL_PREFIX + 'settings/')
    else:
        
        user = User.objects.get(pk=userid)
        userform = UserForm(instance=user)
        profile = UserProfile.objects.get(user=user)
        profileform = UserProfileForm(instance=profile)

    return render_to_response( 'newuser.html', { 
                                "userform": userform,  
                                "profileform": profileform,
                                }
                            )
    return HttpResponseRedirect(settings.URL_PREFIX + 'settings/')
    

def laudio_settings_delete_user(request, userid):
    """Deletes a user by userid"""
    user = User.objects.get(pk=userid)
    user.delete()
    return HttpResponseRedirect(settings.URL_PREFIX + 'settings/')
########################################################################
# AJAX Requests                                                        #
########################################################################
def ajax_drop_collection_db(request):
    """Deletes all playlists and songs in the db"""
    config = LaudioSettings()
    config.resetDB()
    return render_to_response('requests/dropscan.html', { "msg": config })


def ajax_scan_collection(request):
    """Scan the files in the collection"""
    config = LaudioSettings()
    try:
        config.scan()
    except OSError as e:
        return render_to_response( 'settings.html', {"msg": e } )
    return render_to_response('requests/dropscan.html', { "msg": config })


def ajax_song_metadata(request, id):
    """Returns a json object with metainformation about the song
    
    Keyword arguments:
    id -- the id of the song we want the metadata from
    
    """
    song = Song.objects.get(id=id)
    return render_to_response('requests/song_data.html', {"song": song})


def ajax_cover_fetch(request, id):
    """Fetches the URL of albumcover, either locally or from the Internet
    
    Keyword arguments:
    id -- the id of the song we want the cover from
    
    """
    song = Song.objects.get(id=id)
    fetcher = CoverFetcher(song)
    cover = fetcher.fetch()
    return render_to_response('requests/cover.html', {"coverpath": cover, "album": song.album})


def ajax_artists_by_letters(request, artist):
    """Returns songs of all artists starting with artist
    
    Keyword arguments:
    artist -- searches for artists in the db starting with this value
    
    """
    songs = Song.objects.filter(artist__istartswith=artist).extra(select=
    {'lartist': 'lower(artist)', 'lalbum': 'lower(album)', 'ltrnr': 'tracknumber',}
            ).order_by('lartist', 'lalbum', 'ltrnr')
    return render_to_response('requests/songs.html', {'songs': songs, })


def ajax_whole_collection(request):
    """Get all the songs from the collection"""
    songs = Song.objects.all().extra(select=
    {'lartist': 'lower(artist)', 'lalbum': 'lower(album)', 'ltrnr': 'tracknumber',}
            ).order_by('lartist', 'lalbum', 'ltrnr')
    return render_to_response('requests/songs.html', {'songs': songs, })


def ajax_search_collection(request, search):
    """Get song where any field matches the search
    
    Keyword arguments:
    search -- terms we search for in one of our fields
    
    """
    # FIXME:    seperate keywords by space and check db for each element
    #           current setup only retrieves a result when one row matches the search
    #           the search should also match if the parts of the search var appear
    #           in different rows
    songs = Song.objects.filter(
        Q(title__contains=search)|
        Q(artist__contains=search)|
        Q(album__contains=search)|
        Q(genre__contains=search)
    ).extra(select=
            {'lartist': 'lower(artist)', 'lalbum': 'lower(album)', 'ltrnr': 'tracknumber',}
            ).order_by('lartist', 'lalbum', 'ltrnr')
    return render_to_response('requests/songs.html', {'songs': songs, })


def ajax_adv_search_collection(request):
    """Get songs where the fields contain the search params"""
    title = request.GET["title"]
    artist = request.GET["artist"]
    album = request.GET["album"]
    genre = request.GET["genre"]
    songs = Song.objects.filter(title__contains=title,
                                artist__contains=artist,
                                album__contains=album,
                                genre__contains=genre
    ).extra( select={'lartist': 'lower(artist)', 'lalbum': 'lower(album)', 
    'ltrnr': 'tracknumber',} ).order_by('lartist', 'lalbum', 'ltrnr')
    return render_to_response('requests/songs.html', {'songs': songs, })
