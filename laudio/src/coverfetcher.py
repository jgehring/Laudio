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
import os
import urllib, urllib2
from urllib2 import URLError, HTTPError
from lxml import etree
from django.conf import settings
from django.core.urlresolvers import reverse

class CoverFetcher(object):
    
    def __init__(self, song):
        """ Get the cover of a song

        Keyword arguments:
        songpath -- The django model of the song we need. We basically 
                    only need the the attributes: path, artist and album
        """
        self.artist = song.artist.encode("utf-8")
        self.album = song.album.encode("utf-8")
        
        # standardpath, we default to this if no cover is being found
        self.standardCover = '/laudio/media/style/img/nocover.png'
        
        # build the path to the song from audiopath and songdir
        self.relSongDir = os.path.dirname(song.path)
        self.songDir = os.path.join(settings.AUDIO_DIR, self.relSongDir)
        
    
    def fetch(self):
        """ Fetches the songcover from different services
        First it looks locally if images already exists in the folder.
        Only Images with "cover" or "folder" are taken. If no cover is
        being found it queries online services and if it doesnt find
        anything the standardcover is being returned. """
        # FIXME: we got problems with unicode paths
        for file in os.listdir(self.songDir):
            if file.lower().endswith(".jpg") or file.lower().endswith(".jpeg") or file.lower().endswith(".png"):
                # check for folder.jpg or cover.jpg which is very common
                if file.lower().startswith("folder.") or file.lower().startswith("cover."):
                    relPath = os.path.join(self.relSongDir, file)
                    mediaPath = '%smedia/audio' % reverse ("laudio.views.laudio_index")
                    self.cover = os.path.join( mediaPath,  relPath)
                    return urllib.quote(self.cover)

        # if no file was returned check at last.fm
        self.cover = self._lastFM()
        if self.cover is not None:
            return self.cover
        
        # if nothing is found, return standardcover
        return self.standardCover
        
    
    def _lastFM(self):
        """ If a song cant be found locally, query last.fm for the cover
        This method shouldnt be used outside this class
        
        returns -- The path/link to the songcover, None if no cover is found
        """
        
        data = {}
        """ The api key which is unique to LAudio
        
        If you want to implement this for your app you need to register
        your app at last.fm to tell it with which app you submit/get
        data
        """
        data["api_key"] = settings.LAST_FM_API_KEY
        data["method"] = "album.getinfo"
        data["artist"] = self.artist
        data["album"] = self.album
        url_values = urllib.urlencode(data)
        url = 'http://ws.audioscrobbler.com/2.0/'
        full_url = url + '?' + url_values
        
        try:
            response = urllib2.urlopen(full_url)
            elements = etree.fromstring(response.read())
            if elements.get("status") == "ok":
                try:
                    cover = elements.xpath('/lfm/album/image[@size="extralarge"]/text()')[0]
                    return cover
                except IndexError:
                    return None
            else:
                return None

        except (URLError, HTTPError, UnicodeEncodeError):
            return None
