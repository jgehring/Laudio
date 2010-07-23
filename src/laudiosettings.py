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

from laudio.models import *
from laudio.src.musicindexer import MusicIndexer
from django.conf import settings
import os

class LaudioSettings(object):


    def __init__(self):
        """This class is used for Laudio settings, NOT django settings. 
        Those belong into the settings.py!"""
        self.log = []
        # get the path of the current collection if it exists
        if os.path.exists(settings.AUDIO_DIR):
            self.collectionPath = os.readlink(settings.AUDIO_DIR)
        else:
            self.collectionPath = ""
        pass

    
    def scan(self):
        """Scan the directory where the collection is"""
        # we have to add a trailing slash for scanning
        indexer = MusicIndexer( settings.AUDIO_DIR + "/")
        dbPath = settings.DATABASE_NAME
        if not os.access(dbPath, os.W_OK):
            raise OSError("No write access to database! \
                            Use: <b>sudo chmod 0777 %s</b>" % (dbPath))
        indexer.scan()
        self.log.append( "Scanned <b>%i</b> files, updated <b>%i</b> files and \
                         added <b>%i</b> songs to the library!"
                % (indexer.scanned, indexer.modified, indexer.added) )
        # append broken and no right files
        for file in indexer.broken:
            self.log.append( "The file: <b>%s</b> is broken" % file )
        for file in indexer.noRights:
            self.log.append( "The file: <b>%s</b> is not accessible due to filerights" % file )
        
        
    def setCollectionPath(self, path):
        """ Sets the collection path

        Keyword arguments:
        songpath -- The new path to the collection

        """

        # if the given path exists add a symlink, try except is used to 
        # avoid a race condition
        try:
            os.unlink(settings.AUDIO_DIR)
        except OSError:
            pass
        os.symlink( path, settings.AUDIO_DIR )
        self.collectionPath = path
        self.log.append( "Musiclibrarypath set to <b>%s</b>!" % (path) )
        
        
    def resetDB(self):
        """Deletes all songs and playlists in the db"""
        Song.objects.all().delete()
        Playlist.objects.all().delete()
        self.log.append( "Deleted all files and playlists in the Database!" )


    def  __str__(self):
        """Returns log entries"""
        return '<br />'.join(self.log)
            
