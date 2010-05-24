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

from django.template import Context, Template
from django.conf import settings

import os

class JavaScript(object):
    
    def __init__(self, view):
        """First we set the functions and files we have to include for
        the view we serve
        
        Keyword arguments:
        view -- can be: "library", "settings" or "playlist"; sets javascript
                according to those views
        
        """
        self.view = view
        
        # get the javascript from the file
        self.javascriptFile = os.path.join(settings.INSTALL_DIR, "src/javascript/script.js")
        file = open(self.javascriptFile, 'r')
        text = file.read()
        file.close()
        
        # TODO: make this prettier
        # we dont have access to django 1.2 tags so we have check for the 
        # view here
        if view == "library":
            library = True
            playlist = False
            conf = False
        elif view == "settings":
            conf = True
            playlist = False
            library = False
        elif view == "playlist":
            playlist = True
            conf = False 
            library = False
        else:
            playlist = False 
            conf = False
            library = False
        
        # create template and parse context
        tpl = Template(text)
        context = Context( 
            {
                "URL_PREFIX": settings.URL_PREFIX,
                "playlist": playlist,
                "library": library,
                "settings": conf
            } 
        )
    
        self.javascript = tpl.render(context)


    def __str__(self):
        return self.javascript
