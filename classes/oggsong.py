#!/usr/bin/env python
#-*- coding:utf-8 -*-

"""
    A class for an ogg song
"""
import os
from time import time
from mutagen.oggvorbis import OggVorbis
from song import Song

class OGGSong (Song):

    def __init__(self, path):
        self.path = path
        self.song = OggVorbis(self.path)
        try:
            self.title = self.song['title'][0]
        except KeyError:
            self.title = ""
        
        try:    
            self.artist = self.song['artist'][0]
        except KeyError:
            self.artist = ""
            
        try:
            self.album = self.song['album'][0]
        except KeyError:
            self.album = ""
            
        try:
            self.genre = self.song['genre'][0]
        except KeyError:
            self.genre = ""
            
        # check for empty track number
        try:
            self.tracknumber = int(self.song['tracknumber'][0])
        except ValueError:
            self.tracknumber = 0
        except KeyError:
            self.tracknumber = 0

