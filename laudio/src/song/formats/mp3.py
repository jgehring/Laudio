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
from time import time
from mutagen.mp3 import MP3
from mutagen.easyid3 import EasyID3
from mutagen.id3 import ID3NoHeaderError
from laudio.src.song.song import Song

class MP3Song (Song):

    def __init__(self, path):
        """ Read metainformation from an ogg file
        The multiple KeyErrors check if tags are not Null
        Keyword arguments:
        path -- the full path to the song
        """
        self.codec = "mp3"
        self.path = path
        self.song = MP3(self.path)
        try:
            self.id3 = EasyID3(self.path)
            for key in ('title', 'artist', 'album', 'genre', 'date', 'tracknumber'):
                attr = self.id3.get(key, ('',))[0]
                setattr(self, key, attr.encode("utf-8") )
            self.bitrate = int(self.song.info.bitrate) / 1000
            self.length = int(self.song.info.length)
            # check if tracknumber is numeric
            if not self.tracknumber.isdigit():
                self.tracknumber = 0

        # except no id3 tags
        except (ID3NoHeaderError, AttributeError):
            for key in ('title', 'artist', 'album', 'genre', 'date'):
                setattr(self, key, "")
                self.tracknumber = 0
                self.bitrate = 0
                self.length = 0
                self.title = os.path.basename(self.path)
