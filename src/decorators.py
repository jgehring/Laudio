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

from laudio.models import Settings
# django
from django.conf import settings
from django.http import HttpResponseRedirect
from django.shortcuts import render_to_response
from django.contrib.auth.models import User

def check_login(authLevel):
    """This decorator checks if the user as to be authenticated and checks
    if the level is right. Basic usage is
    
    @login("admin")
    myview(request):
        doSomething()
        
    Keyword arguments:
    authLevel -- Can be "admin" or "user"
    
    """
    
    def decorator(view):
        
        def wrapper(*args, **kwargs):
            """get the first argument which is always the request object
            and check if the user is authenticated"""
            config = Settings.objects.get(pk=1)
            """Sites marked with admin are required to log in regardless
            if requireLogin is set"""
            if config.requireLogin or authLevel == "admin":
                request = args[0]
                user = request.user
                """Check if the user is admin or normal user and is 
                is authorized"""
                if authLevel == "admin":
                    if user.is_superuser:
                        authorized = True
                    else: 
                        authorized = False
                elif authLevel == "user":
                        authorized = True
                
                # check for logged in and if the user is active      
                if user.is_authenticated() and user.is_active:
                    if authorized: 
                        return view(*args, **kwargs)
                    else:
                        return render_to_response( '403.html', {} )
                else:
                    return HttpResponseRedirect( settings.URL_PREFIX + "login/" )
                
            else:
                return view(*args, **kwargs)
        
        return wrapper
    
    return decorator

