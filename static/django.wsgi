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
import sys

# append laudio's parent directory to the sys path
sys.path.append(os.path.join(os.path.abspath(os.path.dirname(__file__)), os.pardir, os.pardir))

os.environ['DJANGO_SETTINGS_MODULE'] = 'laudio.settings'

import django.core.handlers.wsgi
application = django.core.handlers.wsgi.WSGIHandler()

