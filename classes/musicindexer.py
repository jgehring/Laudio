#!/usr/bin/env python
#-*- coding:utf-8 -*-

"""
    An indexer which searches for existing music
"""

import os
from oggsong import OGGSong
from laudio.models import Song
import mutagen
import time


class MusicIndexer (object):
    
    def __init__(self, musicDir):
        self.musicDir = musicDir
        self.scanned = 0
        self.added = 0
        self.modified = 0
         
         
    def scan(self):
        """
        Scans a directory recursively for ogg files
        """
        for root, directories, files in os.walk(self.musicDir):
            for name in files:
                songpath = os.path.join(root, name)
                if name.endswith(".ogg") or name.endswith(".oga"):
                    self.addSong(songpath)
                    self.scanned += 1
              
              
    def addSong(self, songpath):
        """
        Adds a song to the db if it doesnt already exist
        
        @param String songpath:      The path to the ogg file 
        """  
        # get songpath relative to musicdirectory so change of directory wont
        # render db useless
        relSongPath = songpath.replace(self.musicDir, '')
        lastModified = int(os.path.getmtime(songpath))
        try:
            # check if the unique path exists in the db
            song = Song.objects.get(path=relSongPath)
            # if last modified date changed, update the songdata
            if song.lastmodified != lastModified:
                try:
                    ogg = OGGSong(songpath)
                    song.title = ogg.title
                    song.artist = ogg.artist
                    song.album = ogg.album
                    song.genre = ogg.genre
                    song.tracknumber = ogg.tracknumber
                    song.lastmodified = lastModified
                    song.path = relSongPath
                    song.save()
                    self.modified += 1
                except mutagen.oggvorbis.OggVorbisHeaderError:
                    pass
        except Song.DoesNotExist:
            # if song does not exist, add a new line to the db
            # try checks for broken ogg files and skips them
            try: 
                ogg = OGGSong(songpath)
                song = Song(title=ogg.title,
                            artist=ogg.artist,
                            album=ogg.album,
                            genre=ogg.genre,
                            tracknumber=ogg.tracknumber,
                            lastmodified=lastModified,
                            path=relSongPath,
                            added=int( time.time() ),
                            )
                song.save()
                self.added += 1
            except mutagen.oggvorbis.OggVorbisHeaderError:
                pass

