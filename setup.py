#!/usr/bin/env python

from distutils.core import setup

setup(name='laudio',
	version='0.4.2.2',
	description='laudio Music Player',
	author='Bernhard Posselt',
	author_email='bernhard.posselt@gmx.at',
	url='https://github.com/Raydiation/Laudio',
	packages=['laudio', 'laudio/src', 'laudio/src/song', 'laudio/src/song/formats'],
)
