# mixfast

This is an attempt to a web-based mixing application. It runs on a server and needs php to work, but apart from this, setup and usage should be really easy.
All that is needed is a subdirectory with some .mp3 files (right now other formats are not supported). The script does the magic and provides a basic mixer.

This project is made mainly for educational purposes. It should allow students to practise their parts within the full band/orchestra context, while providing a custom mix.

Features:
* automatically creates mixers from media files in a directory
* mixer provides mute, solo and volume per channel plus master volume, mixer reset and global mute/solo off
* A-B loop can be used for practising difficult parts
* navigation marks (study signs, song parts etc.) can be added easily with a file named bookmarks.txt for each directory
* position logging for easy creation of bookmarks files
* only uses plain javascript without any external libraries
* web-based and cross-plattform

Roadmap:
* making it work on iOS...
* panning for channel separation "me"-"others"
* tempo change
* jinja script to create offline versions of a page without the need for a php server


Known problems:
There are some problems with no sound on iPhones and probably other iOS devices. I am working on a solution, but since I can't test on a physical device debugging is hard.
The web audio API should be supported on any modern device, however, there are still some tricky things to work out.
