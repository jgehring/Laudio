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

import os
from laudio.song.formats.ogg import OGGSong
from laudio.models import Song
import mutagen
import time

class MusicIndexer (object):
    
    def __init__(self, musicDir):
        """ Instances some attributes and sets the music directory """
        self.musicDir = musicDir
        self.scanned = 0
        self.added = 0
        self.modified = 0
        self.broken = []


    def scan(self):
        """ Scans a directory recursively for ogg files """
        for root, directories, files in os.walk(self.musicDir):
            for name in files:
                songpath = os.path.join(root, name)
                # TODO: check for ogg audio in the file rather then extension
                #       possible ogv files could be falsy indexed by this
                if name.endswith(".ogg") or name.endswith(".oga"):
                    self.addSong(songpath)
                    self.scanned += 1


    def addSong(self, songpath):
        """ Add a song to the database.

        Keyword arguments:
        songpath -- the full path to the song

        """
        # get songpath relative to musicdirectory so change of directory wont
        # render db useless
        relSongPath = songpath.replace(self.musicDir, '')
        lastModified = int( os.path.getmtime(songpath) )
        try:
            # check if the unique path exists in the db
            song = Song.objects.get(path=relSongPath)
            # if last modified date changed, update the songdata
            if song.lastmodified != lastModified:
                try:
                    musicFile = OGGSong(songpath)
                    for attr in ('title', 'artist', 'album', 'genre',
                                 'tracknumber', 'codec'):
                        setattr(song, attr, getattr(musicFile, attr))
                    song.lastmodified = lastModified
                    song.path = relSongPath
                    song.save()
                    self.modified += 1
                # broken ogg file
                except mutagen.oggvorbis.OggVorbisHeaderError:
                    self.broken.append(songpath)
        except Song.DoesNotExist:
            # if song does not exist, add a new line to the db
            try: 
                musicFile = OGGSong(songpath)
                song = Song(title=musicFile.title,
                            artist=musicFile.artist,
                            album=musicFile.album,
                            genre=musicFile.genre,
                            tracknumber=musicFile.tracknumber,
                            codec=musicFile.codec,
                            lastmodified=lastModified,
                            path=relSongPath,
                            added=int( time.time() ),
                            )
                song.save()
                self.added += 1
            # broken ogg file
            except mutagen.oggvorbis.OggVorbisHeaderError:
                self.broken.append(songpath)

