==============================================
 LAudio - A webbased audioplayer for your LAN
==============================================

.. image::  http://github.com/downloads/Raydiation/Laudio/screenshot_large_v04.png

:Version: 0.4-beta6
:Keywords: python, jquery, django, web, html5, audio, player, javascript, last.fm, libre.fm, json, mp3, ogg, vorbis

Laudio is a webbased player which takes advantage of the HTML5 audio
element to play its music.
Its aim is to replace DAAP which is currently broken in the all major GNOME
audio players.

Laudio is based on the Python Framework Django and uses Apache as server.
Installed on the machine where your music collection resides, it can be accessed
in the whole network. By forwarding Port 80 on your router,
even your friends can listen to it over the Internet.

Getting LAudio
==============
Ubuntu Maverick
---------------
Download the deb package from https://github.com/Raydiation/Laudio/downloads

Or 

Add the PPA to your sources::

    $ sudo apt-add-repository ppa:bernhard-posselt/laudio-ppa

Then update and install it::

    $ sudo apt-get update
    $ sudo apt-get install laudio

Obtaining Source: Unstable
--------------------------

To get the unstable trunk fire up your console and change to the path where you
want the source to be downloaded. Then type in::

    $ git clone git://github.com/Raydiation/Laudio.git
    $ cd Laudio*

to get into the directory. Proceed with ``Installation``

Obtaining Source: Stable
------------------------

Download the source as tar.gz from the `Download Page`_ and extract it to your
personal directory. Fire up a terminal and type in::

    $ cd Laudio*

to get into the directory. Proceed with ``Installation``

Installation
============

If you've downloaded the deb file, install it. Otherwise read on:

This is different from Distribution to Distribution so i wrote a script for the
main Distributions ``Ubuntu``, ``Gentoo`` and ``Arch Linux``

Please read it, it hasnt been tested thouroughly!!!

To run it type::

    $ sudo /bin/bash setup.sh


``IMPORTANT``: THE CURRENT GIT VERSION AND ALPHA 4 or later OF 0.4 NEEDS DJANGO 1.2.1
Go to http://www.djangoproject.com/download/ to read how to install it



.. _`Download Page`: http://github.com/Raydiation/Laudio/downloads
.. _`Ampache`: http://ampache.org/



FAQ
=======================

Which Browsers does Laudio support?
-----------------------------------
Depends wether you want to use MP3 or OGG VORBIS

``MP3``: All, Flash required

``OGG``: Google Chrome, Chromium, Opera, Firefox




Why doesn't Chromium play my MP3?
---------------------------------
Most likely you have to install an extra codecs package, Ubuntu for instance
installs it with:

    $ sudo apt-get install chromium-codecs-ffmpeg-extra




What filerights should my musicdirectory have?
----------------------------------------------
The music files should be chmoded 0755. Every folder above the files has
to have a+x, so Apache can traverse down into the directory




I just added and scanned some music but it doesnt show up in the Library!
-------------------------------------------------------------------------
It's not a bug, it's a feature: Imagine loading 50 000 files on every 
startup; defenitely a browser killer. You can see your files either by
searching or by clicking on the ABC button on the top, where you can 
select the starting letters of the artist.





How can i change the URL under which Laudio is being run
--------------------------------------------------------
If you want to let Laudio run under a different URL then localhost/laudio, like
localhost/audio for instance, you can now easily adjust it.

Open the laudio_apache.conf in the Apache config folder and change the two lines to::

    Alias /audio/media/ /usr/share/laudio/media/
    WSGIScriptAlias /audio /usr/share/laudio/media/django.wsgi

Finally restart your Apache webserver.




Getting Help
============

IRC
---

We reside on irc.freenode.net in channel ``#laudio``.

Messenger & Email
-----------------

If you dont reach me in IRC, i dont mind if you ask me via Messenger or Email:

email: bernhard.posselt@gmx.at

jabber: xray99@jabber.ccc.de

Bug tracker
===========

If you have any suggestions, bug reports or annoyances please report them
to our issue tracker at http://github.com/Raydiation/Laudio/issues

Contributing
============

To contribute send a mail to: bernhard.posselt@gmx.at

License
=======

This software is licensed under the ``GPLv3``. See the ``COPYING``
file in the top directory for the full license text.

