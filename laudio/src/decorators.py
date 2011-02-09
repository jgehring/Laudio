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

from laudio.models import Settings
# django
from django.conf import settings
from django.http import HttpResponseRedirect
from django.shortcuts import render_to_response
from django.contrib.auth.models import User
from django.template import RequestContext
from django.core.urlresolvers import reverse

def check_login(authLevel):
    """This decorator checks if the user has to be authenticated and checks
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
            try:
                config = Settings.objects.get(pk=1)
                requireLogin = config.requireLogin
            except Settings.DoesNotExist:
                requireLogin = False
            """Sites marked with admin are required to log in regardless
            if requireLogin is set"""
            if requireLogin or authLevel == "admin":
                request = args[0]
                user = request.user
                """Check if the user is admin or normal user and
                is authorized"""
                if authLevel == "admin":
                    if user.is_superuser:
                        authorized = True
                    else: 
                        """Check if there is any superuser at all, if not
                        allow everyone to access the admin settings"""
                        superusers = User.objects.filter(is_superuser=1).count()
                        if superusers == 0:
                            return view(*args, **kwargs)
                        else:
                            authorized = False
                elif authLevel == "user":
                        authorized = True
                
                # check for logged in and if the user is active      
                if user.is_authenticated() and user.is_active:
                    if authorized: 
                        return view(*args, **kwargs)
                    else:
                        return render_to_response( '403.html', {}, 
                                context_instance=RequestContext(request) )
                else:
                    redirect = "%s?next=%s" % ( reverse("django.contrib.auth.views.login"), 
                                           reverse("laudio.views.laudio_index") )
                    return HttpResponseRedirect(redirect)
                
            else:
                return view(*args, **kwargs)
        
        return wrapper
    
    return decorator

