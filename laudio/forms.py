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

from django import forms
from django.contrib.auth.models import User
from django.conf import settings
from laudio.models import *
import os

class UserProfileForm(forms.ModelForm):
    class Meta:
        model = UserProfile
        exclude = ("user")
        widgets = {
            'lastFMPass': forms.PasswordInput(render_value=False),
            'libreFMPass': forms.PasswordInput(render_value=False),
        }

class UserForm(forms.ModelForm):
    is_superuser = forms.BooleanField(label="Superuser", 
        help_text="Sets if the user is a superuser. If a superuser exists, \
        only superusers can view the settings dialogue", required=False)
    class Meta:
        model = User
        exclude = ("first_name", "last_name", "is_staff", "last_login", 
                   "date_joined", "groups", "user_permissions", "password")

class UserEditForm(forms.ModelForm):
    is_superuser = forms.BooleanField(label="Superuser", 
        help_text="Sets if the user is a superuser. If a superuser exists, \
        only superusers can view the settings dialogue")
    class Meta:
        model = User
        exclude = ("first_name", "last_name", "is_staff", "last_login", 
                   "date_joined", "groups", "user_permissions", "password",
                   "username")

class UserEditProfileForm(forms.ModelForm):
    class Meta:
        model = User
        exclude = ("first_name", "last_name", "is_staff", "last_login", 
                   "date_joined", "groups", "user_permissions", "password",
                   "username", "is_active", "is_superuser")


class SettingsForm(forms.ModelForm):
    class Meta:
        model = Settings
        
    def clean_collection(self):
        data = self.cleaned_data['collection']
        """We move down folder by folder from the given path and check,
        if we can cd into the folder (we need a+x to cd into it).
        If we get any errors, we stop and tell the user to execute the right
        commands."""
        
        # TODO: check cmds!
        checkPath = data.split("/")
        checkedPath = ""
        for p in checkPath:
            
            # if path is empty check the next element
            # concerns the first and last slash
            if not p:
                continue
            checkedPath += "/" + p
            
            # check for path existence and access rights
            if not os.access(checkedPath, os.F_OK):
                raise forms.ValidationError("Path %s does not exist!" % checkedPath)
            if not os.access(checkedPath, os.X_OK):
                raise forms.ValidationError( "No access rights for %s! Use: <b>sudo \
                        chmod a+x %s</b>" % (checkedPath, checkedPath) )
                
        """now check if we got read rights on the music folder, we could do this
        recursively to check every folder but that would waste too mucht time"""
        if not os.access(data, os.R_OK):
            raise forms.ValidationError( "Music collection is not readable! Use: <b>sudo chmod \
                           -R 0755 %s</b>" % (data) )

        # check if we can set a symlink
        mediaPath = settings.MEDIA_ROOT
        if not os.access(mediaPath, os.R_OK):
            raise forms.ValidationError( "No write Access in media directory! \
                           Use: <b>sudo chmod -R 0777 %s</b>" % (mediaPath) )
            
        return data
