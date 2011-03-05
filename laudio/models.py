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
along with Foobar.  If not, see <http://www.gnu.org/licenses/>.

"""

from django.contrib.auth.models import User
from django.conf import settings
from django.db import models
from django import forms

class Song(models.Model):
    title = models.CharField(max_length=250)
    artist = models.CharField(max_length=150)
    album = models.CharField(max_length=150)
    genre = models.CharField(max_length=50)
    codec = models.CharField(max_length=10)
    tracknumber = models.IntegerField()
    path = models.CharField(max_length=250, unique=True)
    lastmodified = models.IntegerField()
    added =  models.IntegerField()
    length = models.IntegerField();
    bitrate = models.CharField(max_length=100);
    date = models.CharField(max_length=100);


class Playlist(models.Model):
    name = models.CharField(max_length=250)
    added = models.IntegerField()
    songs = models.ManyToManyField(Song, through="PlaylistEntry")
    user = models.ForeignKey(User)


class PlaylistEntry(models.Model):
    playlist = models.ForeignKey(Playlist)
    song = models.ForeignKey(Song)


class Settings(models.Model):
    collection = models.CharField("Collection", max_length=500, 
        help_text="Sets ONLY the path to your music files! To add the \
                    files to your library hit the \"Scan collection\" \
                    button button above. All directories above the music \
                    directory need to have the rights a+x, all music files \
                    need to be 0755")
    requireLogin = models.BooleanField("Require Login", 
        help_text="All users who want to listen to your files have to log in")
    showLib = models.BooleanField("Show all songs on startup", 
        help_text="This displays your whole collection automatically on startup. \
                    Be carefull with bigger collections as it may impact your \
                    browser's speed")
    debugAudio = models.BooleanField("Debug", 
        help_text="Enable output to your firebug console including audio debug information \
                    and writing of debug information while scanning your collection \
                    to %s" % settings.DEBUG_LOG)
    hidePlaylist = models.BooleanField("Hide playlist by default", help_text="Automatically \
                    hides the playlist in the Collection view so you have \
                    to click playlist to view it")
    hideSidebar = models.BooleanField("Hide sidebar by default", help_text="Automatically \
                    hides the sidebar in the Collection view so you have \
                    to click sidebar to view it")
    


class UserProfile(models.Model):
    user = models.ForeignKey(User, unique=True)
    lastFMName = models.CharField("last.fm username", max_length=100, blank=True)
    lastFMPass = models.CharField("last.fm password", max_length=100, blank=True)
    lastFMSubmit = models.BooleanField("Scrobble last.fm", 
        help_text="Activate this if you want to submit your played tracks \
                    to your last.fm account")
    libreFMName = models.CharField("libre.fm username", max_length=100, blank=True)
    libreFMPass = models.CharField("libre.fm password", max_length=100, blank=True)
    libreFMSubmit = models.BooleanField("Scrobble libre.fm",
        help_text="Activate this if you want to submit your played tracks \
                    to your libre.fm account")
    showLib = models.BooleanField("Show all songs on startup", 
                help_text="This displays your whole collection automatically on startup. \
                            Be carefull with bigger collections as it may impact your \
                            browser's speed")
    hidePlaylist = models.BooleanField("Hide playlist by default", help_text="Automatically \
                    hides the playlist in the Collection view so you have \
                    to click playlist to view it")
    hideSidebar = models.BooleanField("Hide sidebar by default", help_text="Automatically \
                    hides the sidebar in the Collection view so you have \
                    to click sidebar to view it")
