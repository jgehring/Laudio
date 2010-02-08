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

from django.conf.urls.defaults import *
from laudio.views import *

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
    # Example:
    # (r'^laudio/', include('laudio.foo.urls')),

    # Uncomment the admin/doc line below and add 'django.contrib.admindocs' 
    # to INSTALLED_APPS to enable admin documentation:
    # (r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # (r'^admin/', include(admin.site.urls)),

    (r'^search/$', search),
    (r'^friends/$', friends),
    (r'^settings/$', laudio_settings),
    (r'^about/$', about),

    #collection and playlist part
    (r'^$', index),
    (r'^collection/$', whole_collection),
    (r'^artist/(?P<artist>.*)/$', slim_collection),
    (r'^searchall/(?P<search>.*)/$', search_collection),
    (r'^advsearch/$', adv_search),
    (r'^playlist/$', playlist),
    (r'^playlist/collection/$', whole_collection, {'playlist': True}),
    (r'^playlist/artist/(?P<artist>.*)/$', slim_collection, {'playlist': True}),
    (r'^playlist/searchall/(?P<search>.*)/$', search_collection, {'playlist': True}),
    (r'^playlist/advsearch/$', adv_search, {'playlist': True}),
    # playlist requests
    (r'^playlist/save/$', save_playlist),
    (r'^playlist/open/(?P<playlistName>.*)/$', open_playlist),
    (r'^playlist/delete/(?P<playlistName>.*)/$', delete_playlist),
    (r'^playlist/rename/(?P<oldName>.*)/(?P<newName>.*)/$', rename_playlist),
    (r'^playlist/list/$', list_playlists),
    # ampache api
    (r'^server/xml.server.php$', ampache_api),
)
