==============================================
 LAudio - A webbased audioplayer for your LAN
==============================================

:Version: 0.2.0
:Keywords: python, jquery, django, web, html5, audio, player, javascript

--

Laudio is a webbased player which takes advantage of the HTML5 audio
element to play its music.
Its aim is to replace DAAP which is currently broken in the all major GNOME
audio players.

Laudio is based on the Python Framework Django and uses Apache as server.
Installed on the machine where your music collection resides, it can be accessed
in the whole network. By forwarding Port 80 on your router,
even your friends can listen to it over the Internet.

Future versions will include `Celery`_ for visual feedback when scanning the music
director and will implement an authorization framework for listeners.

To get it working without browser the `Ampache`_ API will be implemented

Installation
============

Obtaining Source: Unstable
==========================

To get the unstable trunk fire up your console and change to the path where you
want the source to be downloaded. Then type in::

    $ git clone git://github.com/Raydiation/Laudio.git
    $ cd Laudio*

to get into the directory. Proceed with ``Installation``

Obtaining Source: Stable
========================

Download the source as tar.gz from the `Download Page`_ and extract it to your
personal directory. Fire up a terminal and type in::

    $ cd Laudio*

to get into the directory. Proceed with ``Installation``

Installation
============

This is different from Distribution to Distribution so i will outline it for the
main Distributions ``Ubuntu``, ``Gentoo`` and ``Arch Linux``:

Ubuntu
======

Type the following commands in the terminal residing in the downloaded Folder::

    $ sudo apt-get install python-lxml python-django python-mutagen apache2 sqlite3 libapache2-mod-wsgi python-pysqlite2 rabbitmq-server
    $ sudo move laudio_apache.conf /etc/apache2/conf.d/
    $ sudo chown root:root /etc/apache2/conf.d/laudio_apache.conf





.. _`Download Page`: http://github.com/Raydiation/Laudio/downloads
.. _`Celery`: http://github.com/ask/celery
.. _`Ampache`: http://ampache.org/

Getting Help
============

IRC
---

We reside on irc.freenode.net in channel ``#laudio``.


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

