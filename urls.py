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
)
