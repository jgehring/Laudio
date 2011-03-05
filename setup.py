#!/usr/bin/env python

from distutils.core import setup

setup(name='laudio',
	version='0.5.2.0',
	description='laudio Music Player',
	author='Bernhard Posselt',
	author_email='bernhard.posselt@gmx.at',
	url='https://github.com/Raydiation/Laudio',
	packages=['laudio', 'laudio/src', 'laudio/src/song', 'laudio/src/song/formats'],
	package_data={'' : ['laudio/media/*', 'laudio/media/js/*', 'laudio/media/style/*', 
'laudio/media/style/img/*', 'laudio/tpl/*', 'laudio/tpl/inc/*', 'laudio/tpl/requests/*', 
'laudio/tpl/settings/*', 'laudio/src/*', 'laudio/src/javascript/func/*', 
'laudio/src/javascript/inc/*', 'laudio/src/javascript/ui/*']}
)

