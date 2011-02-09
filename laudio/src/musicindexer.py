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
import mutagen
import time
# django imports
from django.conf import settings
# laudio specific imports
from laudio.src.song.formats.ogg import OGGSong
from laudio.src.song.formats.mp3 import MP3Song
from laudio.models import Song, Settings


class MusicIndexer (object):
    
    def __init__(self, musicDir):
        """ Instances some attributes and sets the music directory
        
        Keyword arguments:
        musicDir -- the directory where musiccollection lies; the string
                    has to end with a slash because we save the relative
                    path
        
        """
        self.musicDir = musicDir.encode("utf-8")
        self.scanned = 0
        self.added = 0
        self.modified = 0
        self.broken = []
        self.noRights = []
        # check config vars
        try:
            config = Settings.objects.get(pk=1)
            self.debug = config.debugAudio
        except Settings.DoesNotExist, AttributeError:
            self.debug = False 


    def scan(self):
        """ Scans a directory recursively for ogg files """
        # reset count
        self._updateScanCount(True)
        # scan all files
        fileList = []
        for root, directories, files in os.walk(self.musicDir):
            for name in files:
                if name.lower().endswith(".ogg") or name.lower().endswith(".oga") \
                                                 or name.lower().endswith("mp3"):
                    fileList.append( os.path.join( root, name ) )
        # add a new scan entry
        self.total = len(fileList)
        if self.debug:
            self._debug("Begin Scan")
        # now add the files to the db
        for name in fileList:
            # TODO: check for ogg audio in the file rather then extension
            #       possible ogv files could be falsy indexed by this
            if name.lower().endswith(".ogg") or name.lower().endswith(".oga"):
                if self.debug:
                    self._debug("Scanned %s" % name)
                self._addSong( name, "ogg" )
                self._updateScanCount()
            if name.lower().endswith(".mp3"):
                if self.debug:
                    self._debug("Scanned %s" % name)
                self._addSong( name, "mp3" )
                self._updateScanCount()
        if self.debug:
            self._debug("Finished Scan")
        

    def _addSong(self, songpath, codec):
        """ Add a song to the database.

        Keyword arguments:
        songpath -- the full path to the song
        codec    -- the codec type we're using

        """
        # get songpath relative to musicdirectory so change of directory wont
        # render db useless
        relSongPath = songpath.replace(self.musicDir, '')
        lastModified = int( os.path.getmtime(songpath) )
        try:
            try:
                # check if the unique path exists in the db
                song = Song.objects.get( path=relSongPath )
                # if last modified date changed, update the songdata
                if song.lastmodified != lastModified:
                    try:
                        musicFile = self._musicFile( songpath, codec )
                        for attr in ('title', 'artist', 'album', 'genre',
                                     'tracknumber', 'codec', 'bitrate', 
                                     'length', 'date'):
                            setattr( song, attr, getattr(musicFile, attr) )
                        song.lastmodified = lastModified
                        song.path = relSongPath
                        song.save()
                        self.modified += 1
                        self._debug("modified %s in the db" % songpath)
                    # broken ogg file
                    except mutagen.oggvorbis.OggVorbisHeaderError:
                        self.broken.append(songpath)
            except Song.DoesNotExist:
                # if song does not exist, add a new line to the db
                try: 
                    musicFile = self._musicFile(songpath, codec)
                    song = Song(title=musicFile.title,
                                artist=musicFile.artist,
                                album=musicFile.album,
                                genre=musicFile.genre,
                                tracknumber=musicFile.tracknumber,
                                codec=musicFile.codec,
                                lastmodified=lastModified,
                                path=relSongPath,
                                added=int( time.time() ),
                                length=musicFile.length,
                                bitrate=musicFile.bitrate,
                                date=musicFile.date
                                )
                    song.save()
                    self.added += 1
                    self._debug("added %s to the db" % songpath)
                # broken ogg file
                except mutagen.oggvorbis.OggVorbisHeaderError:
                    self.broken.append(songpath)
        except IOError:
            self.noRights.append(songpath)


    def _debug(self, msg):
        """If no debug log exists, we make a new one"""
        f = open(settings.DEBUG_LOG, 'a')
        f.write( '%s\n' % msg )
        f.close()


    def _updateScanCount(self, reset=False):
        """Updates values in the scan log"""
        if reset == True:
            f = open(settings.SCAN_LOG, 'w')
            f.write( '%s %s' % (0, 1) )
            f.close()
        else:
            self.scanned += 1
            # open file only for every ten songs
            if self.scanned % 10 == 0:
                f = open(settings.SCAN_LOG, 'w')
                f.write( '%s %s' % (self.scanned, self.total) )
                f.close()


    def _musicFile(self, songpath, codec):
        """ Returns the object according to the codec 
        
            Keyword arguments:
            songpath -- the full path to the song
            codec    -- the codec type we're using
            
        """
        if codec == "ogg":
            return OGGSong(songpath)
        elif codec == "mp3":
            return MP3Song(songpath)
