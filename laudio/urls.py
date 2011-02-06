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
    
    # settings
    (r'^settings/$', laudio_settings),
    (r'^settings/resetdb/$', ajax_drop_collection_db),
    (r'^settings/scan/$', ajax_scan_collection),
    (r'^settings/newuser/$', laudio_settings_new_user),
    (r'^settings/deleteuser/(?P<userid>.*)/$', laudio_settings_delete_user),
    (r'^settings/edituser/(?P<userid>.*)/$', laudio_settings_edit_user),
    
    # collection
    (r'^$', laudio_index),
    (r'^collection/$', ajax_whole_collection),
    (r'^artist/(?P<artist>.*)/$', ajax_artists_by_letters),
    (r'^searchall/(?P<search>.*)/$', ajax_search_collection),
    (r'^advsearch/$', ajax_adv_search_collection),
    (r'^song_data/(?P<id>.*)/$', ajax_song_metadata),
    (r'^scrobble/(?P<id>.*)/$', ajax_scrobble_song),
    (r'^cover/(?P<id>.*)/$', ajax_cover_fetch),
    (r'^advautocomplete/(?P<row>.*)/$', ajax_adv_autocompletion),
    
    # debug
    (r'^debug/$', ajax_debug_log),
    
    # other sites
    (r'^about/$', laudio_about),
    (r'^profile/$', laudio_profile),
    (r'^login/', 'django.contrib.auth.views.login', {'template_name': 'login.html'}),
    (r'^logout/$', 'django.contrib.auth.views.logout', {'template_name': 'logout.html'}),
)
