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
from laudio.src.javascript import JavaScript
from laudio.src.decorators import check_login
import laudio.src.scrobbler as scrobbler
from laudio.models import *
from laudio.forms import *
# django
from django.shortcuts import render_to_response
from django.db.models import Q
from django.utils.datastructures import MultiValueDictKeyError
from django.conf import settings
from django.http import HttpResponse
from django.http import HttpResponseRedirect
from django.contrib.auth.models import User
from django.contrib.auth import logout
from django.contrib.auth import authenticate, login
from django.template import RequestContext
from django.core.urlresolvers import reverse
from django.core.context_processors import csrf

# other python libs
import time
import os
import urllib


########################################################################
# Shortcuts                                                            #
########################################################################

def render(request, tpl, tplvars={}):
    """Shortcut for renewing csrf cookie and passing request context
    
    Keyword arguments:
    tpl -- the template we want to use
    args -- the template variables

    """
    tplvars.update(csrf(request))
    # check config vars
    try:
        config = Settings.objects.get(pk=1)
        tplvars["audio_debug"] = config.debugAudio
    except Settings.DoesNotExist, AttributeError:
        tplvars["audio_debug"] = False 

    return render_to_response(tpl, tplvars,
                               context_instance=RequestContext(request))

########################################################################
# Visible Sites                                                        #
########################################################################
@check_login("user")
def laudio_index(request):
    """The collection view which is displayed as index by default
    
    If the directory is not set and thus you can't play songs, redirect
    to the settings page."""
    try:
        settings = Settings.objects.get(pk=1)
    except Settings.DoesNotExist:
        return HttpResponseRedirect( reverse ("laudio.views.laudio_settings") )
    # get javascript
    js = JavaScript("library", request)
    return render(request, 'index.html', { 'js': js })
                                

def laudio_about(request):
    """A plain about site"""
    return render(request, 'about.html', {})


@check_login("admin")
def laudio_settings(request):
    """Site where the configuration happens"""
    config = LaudioSettings()
    users = User.objects.all()
    if request.method == 'POST':
        settingsForm = SettingsForm(request.POST)
        if settingsForm.is_valid(): 
            # get the first setting in the db
            try:
                settings = Settings.objects.get(pk=1)
            except Settings.DoesNotExist:
                settings = Settings()
            fields = ("requireLogin", "debugAudio", "collection")
            # write data into db
            for key in fields:
                setattr(settings, key, settingsForm.cleaned_data[key])
            settings.save()
            # set symlink
            config.setCollectionPath(settingsForm.cleaned_data['collection'])
    else:
        try:
            settings = Settings.objects.get(pk=1)
            settingsForm = SettingsForm(instance=settings)
        except Settings.DoesNotExist:
            settingsForm = SettingsForm(initial={'cacheSize': 100})
            
    # get javascript
    js = JavaScript("settings", request)
    return render(request, 'settings/settings.html', { "collection": config.collectionPath,  
                                               "settingsForm": settingsForm,
                                               "users": users,
                                               "js": js, 
                                            }
                 )
                     
                            
@check_login("admin")    
def laudio_settings_new_user(request):
    """Create a new user"""
    if request.method == 'POST':
        userform = UserForm(request.POST)
        profileform = UserProfileForm(request.POST)
        
        if userform.is_valid() and profileform.is_valid(): 
            user = User(username=userform.cleaned_data['username'],
                        email=userform.cleaned_data['email'],
                        is_superuser=userform.cleaned_data['is_superuser'],
                        is_active=userform.cleaned_data['is_active'])
            user.set_password( request.POST.get('password') )
            user.save()
            # profile
            profile = UserProfile(user=user)
            for key in ("lastFMName", "lastFMPass", "lastFMSubmit", 
                         "libreFMName", "libreFMPass", "libreFMSubmit"):
                setattr(profile, key, profileform.cleaned_data[key])
            profile.save()
            return HttpResponseRedirect( reverse ("laudio.views.laudio_settings") )
    else:
        userform = UserForm()
        profileform = UserProfileForm()

    return render(request, 'settings/newuser.html', { "userform": userform,  
                                                          "profileform": profileform
                                                        }
                            )


@check_login("admin")
def laudio_settings_edit_user(request, userid):
    """Edit a user by userid"""
    if request.method == 'POST':
        
        userform = UserEditForm(request.POST)
        profileform = UserProfileForm(request.POST)
        
        if userform.is_valid() and profileform.is_valid(): 
            user = User.objects.get(pk=userid)
            user.email = userform.cleaned_data['email']
            user.is_superuser = userform.cleaned_data['is_superuser']
            user.is_active = userform.cleaned_data['is_active']
            if request.POST.get('password') != "":
                user.set_password( request.POST.get('password') )
            user.save()
            # profile
            profile = UserProfile.objects.get(user=user)
            profile.user = user
            for key in ("lastFMName", "lastFMPass", "lastFMSubmit", 
                         "libreFMName", "libreFMPass", "libreFMSubmit"):
                setattr(profile, key, profileform.cleaned_data[key])
            profile.save()
            return HttpResponseRedirect( reverse ("laudio.views.laudio_settings") )
    else:
        user = User.objects.get(pk=userid)
        userform = UserEditForm(instance=user)
        profile = UserProfile.objects.get(user=user)
        profileform = UserProfileForm(instance=profile)

    return render(request, 'settings/edituser.html', { "userform": userform,  
                                                          "profileform": profileform
                                                        }
                            )


@check_login("admin")
def laudio_settings_delete_user(request, userid):
    """Deletes a user by userid"""
    user = User.objects.get(pk=userid)
    user.delete()
    return HttpResponseRedirect( reverse ("laudio.views.laudio_settings") )
    
    
@check_login("user")
def laudio_profile(request):
    """Edit a profile"""
    user = request.user
    
    if request.method == 'POST':
        
        userform = UserEditProfileForm(request.POST)
        profileform = UserProfileForm(request.POST)
        
        if userform.is_valid() and profileform.is_valid(): 
            user.email = userform.cleaned_data['email']
            if request.POST.get('password') != "":
                user.set_password( request.POST.get('password') )
            user.save()
            # profile
            profile = UserProfile.objects.get(user=user)
            profile.user = user
            for key in ("lastFMName", "lastFMPass", "lastFMSubmit", 
                         "libreFMName", "libreFMPass", "libreFMSubmit"):
                setattr(profile, key, profileform.cleaned_data[key])
            profile.save()
            return HttpResponseRedirect( reverse ("laudio.views.laudio_profile") )
    else:
        
        userform = UserEditProfileForm(instance=user)
        profile = UserProfile.objects.get(user=user)
        profileform = UserProfileForm(instance=profile)

    return render(request, 'settings/profile.html', { "userform": userform,  
                                                          "profileform": profileform
                                                        }
                            )
########################################################################
# AJAX Requests                                                        #
########################################################################
@check_login("admin")
def ajax_drop_collection_db(request):
    """Deletes all playlists and songs in the db"""
    config = LaudioSettings()
    config.resetDB()
    return render_to_response('requests/dropscan.html', { "msg": config.log })


@check_login("admin")
def ajax_scan_collection(request):
    """Scan the files in the collection"""
    config = LaudioSettings()
    try:
        config.scan()
    except OSError, e:
        return render_to_response( 'requests/dropscan.html', {"msg": e } )
    return render_to_response('requests/dropscan.html', { "msg": config.log })


@check_login("user")
def ajax_song_metadata(request, id):
    """Returns a json object with metainformation about the song
    
    Keyword arguments:
    id -- the id of the song we want the metadata from
    
    """
    song = Song.objects.get(id=id)
    return render_to_response('requests/song_data.html', {"song": song})


@check_login("user")
def ajax_scrobble_song(request, id):
    """Scrobbles a song to last.fm and/or libre.fm
    
    Keyword arguments:
    id -- the id of the song we want to scrobble
    
    """
    song = Song.objects.get(id=id)
    msg = ""
    
    # if user is logged in submit stats
    if request.user.is_authenticated():
        now = int(time.mktime(time.gmtime()))
        userprofile = request.user.get_profile()
        # check for last.fm scrobbling
        try:
            if request.user.get_profile().lastFMSubmit:
                if userprofile.lastFMName != "" and userprofile.lastFMPass != "":
                    scrobbler.login(userprofile.lastFMName,
                                    userprofile.lastFMPass,
                                    service="lastfm"
                                    )
                    scrobbler.submit(song.artist, song.title, now, source='P',
                                    length=song.length)
                    scrobbler.flush()
                    msg = msg + "Scroblled song to lastfm!<br />"
        # if something bad happens, just ignore it
        except (scrobbler.BackendError, scrobbler.AuthError,
                scrobbler.PostError, scrobbler.SessionError,
                scrobbler.ProtocolError):
            pass
            
        # check for libre.fm scrobbling
        try:
            if request.user.get_profile().libreFMSubmit:
                if userprofile.libreFMName != "" and userprofile.libreFMPass != "":
                    scrobbler.login(userprofile.libreFMName, 
                                    userprofile.libreFMPass,
                                    service="librefm" 
                                    )
                    scrobbler.submit(song.artist, song.title, now, source='P',
                                    length=song.length)
                    scrobbler.flush()
                    msg = msg + "Scroblled song to librefm!<br />"
        # if something bad happens, just ignore it
        except (scrobbler.BackendError, scrobbler.AuthError,
                scrobbler.PostError, scrobbler.SessionError,
                scrobbler.ProtocolError):
            pass

    return render_to_response('requests/scrobble.html', {"msg": msg})


@check_login("user")
def ajax_cover_fetch(request, id):
    """Fetches the URL of albumcover, either locally or from the Internet
    
    Keyword arguments:
    id -- the id of the song we want the cover from
    
    """
    song = Song.objects.get(id=id)
    fetcher = CoverFetcher(song)
    cover = fetcher.fetch()
    return render_to_response('requests/cover.html', {"coverpath": cover, "album": song.album})


@check_login("user")
def ajax_artists_by_letters(request, artist):
    """Returns songs of all artists starting with artist
    
    Keyword arguments:
    artist -- searches for artists in the db starting with this value
    
    """
    #artist = artist.encode("utf-8")
    songs = Song.objects.filter(artist__istartswith=artist).extra(select=
    {'lartist': 'lower(artist)', 'lalbum': 'lower(album)', 'ltrnr': 'tracknumber',}
            ).order_by('lartist', 'lalbum', 'ltrnr')
    return render_to_response('requests/songs.html', {'songs': songs, })


@check_login("user")
def ajax_whole_collection(request):
    """Get all the songs from the collection"""
    songs = Song.objects.all().extra(select=
    {'lartist': 'lower(artist)', 'lalbum': 'lower(album)', 'ltrnr': 'tracknumber',}
            ).order_by('lartist', 'lalbum', 'ltrnr')
    return render_to_response('requests/songs.html', {'songs': songs, })


@check_login("user")
def ajax_adv_autocompletion(request, row): 
    """This is the advanced autocompletion. We got 4 fields where the 
    can enter data. The data entered will be send as GET var term.
    The remaining 3 fields will be available as GET vars, title, artist,
    album or genre.
    
    Keyword arguments:
    row -- the field where the search is being entered
    
    """
    if request.method == "GET":
        songs = Song.objects.filter(
                title__contains=request.GET.get("title", ""),
                artist__contains=request.GET.get("artist", ""),
                album__contains=request.GET.get("album", ""),
                genre__contains=request.GET.get("genre", ""),
        ).values(row).distinct()
        return render_to_response('requests/autocomplete.html', {'songs': songs, 'row': row})
    #'values': songs.get(row)

@check_login("user")
def ajax_search_collection(request, search):
    """Get song where any field matches the search
    
    Keyword arguments:
    search -- terms we search for in one of our fields
    
    """
    # FIXME:    seperate keywords by space and check db for each element
    #           current setup only retrieves a result when one row matches the search
    #           the search should also match if the parts of the search var appear
    #           in different rows
    
    """Check if we get this via GET as an autocomplete request"""
    songs = Song.objects.filter(
        Q(title__contains=search)|
        Q(artist__contains=search)|
        Q(album__contains=search)|
        Q(genre__contains=search)
    ).extra(select=
            {'lartist': 'lower(artist)', 'lalbum': 'lower(album)', 'ltrnr': 'tracknumber',}
            ).order_by('lartist', 'lalbum', 'ltrnr')
    return render_to_response('requests/songs.html', {'songs': songs, })


@check_login("user")
def ajax_adv_search_collection(request):
    """Get songs where the fields contain the search params"""
    title = urllib.unquote( request.GET.get("title", "") )
    length = urllib.unquote( request.GET.get("length", "") )
    tracknr = urllib.unquote( request.GET.get("tracknr", "") )
    artist = urllib.unquote( request.GET.get("artist", "") )
    album = urllib.unquote( request.GET.get("album", "") )
    date = urllib.unquote( request.GET.get("date", "") )
    genre = urllib.unquote( request.GET.get("genre", "") )
    codec = urllib.unquote( request.GET.get("codec", "") )
    bitrate = urllib.unquote( request.GET.get("bitrate", "") )
    songs = Song.objects.filter(title__contains=title,
                                length__contains=length,
                                tracknumber__contains=tracknr,
                                artist__contains=artist,
                                album__contains=album,
                                date__contains=date,
                                genre__contains=genre,
                                codec__contains=codec,
                                bitrate__contains=bitrate
    ).extra( select={'lartist': 'lower(artist)', 'lalbum': 'lower(album)', 
    'ltrnr': 'tracknumber',} ).order_by('lartist', 'lalbum', 'ltrnr')
    return render_to_response('requests/songs.html', {'songs': songs, })

