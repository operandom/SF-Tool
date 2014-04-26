SF Tool
=======

A tool for Symfony2 projects. Also works with other PHP projects.

![web preview] (resources/images/screen-main.png?raw=true)

![web preview] (resources/images/screen-drop.png?raw=true)

Requirements
------------

SF tool needs **PHP >=5.4** to be installed on your system and be present in your PATH environment variable to launch the server automatically.


Installation
------------

### Windows & Mac
Simply uncompress the release archive somewhere.


### Linux
Simply uncompress the release archive somewhere.<br>
If the application doesn't start, verify that ``libudev.so.0`` is installed.<br>
If you can't install ``libudev.so.0`` try something like this in a terminal:

*	64 bit system: `sudo ln -s /lib/x86_64-linux-gnu/libudev.so.1.3.5 /usr/lib/libudev.so.0`
*	32 bit system: `sudo ln -s /lib/i386-linux-gnu/libudev.so.1.3.5 /usr/lib/libudev.so.0`


Usage
-----

Launch the application. Drop a folder.


### Terminal shortcuts and commands:

*	**`sf`** Shortcut for `php app/console` (symfony.
*	**`clear`** Clean the terminal.


Changelog
---------

### v0.1.1
*	the server is now launched on a free port instead of port 80
*	the server can now be accessed on the lan
*	add global trace() function in PHP to log in the server terminal


For developers
--------------

```bash
$ git clone https://github.com/operandom/SF-Tool.git
$ cd SF-Tool
$ git checkout Dev
$ npm install -g grunt-cli
$ npm install
$ cd app
$ npm install
$ cd ..
$ grunt # Run jshint task and build applications for all platforms. 
```
Modify `Gruntfile.js` to select the application you want to build.


@TODO
-----

*	Open last folder on startup.
*	Add choice list of available commands.
*	Add input to set server's address and port.
*	Add a global menu bar.
*	Add a real teminal (color, no input in the bottom, color, etc).
*	Add keyword/shortcut system.
*	Add capability to save preferences.
*	Add a theme system.
*	Make ".bat" and ".cmd" work in terminal on Windows.
	Currently you need to launch cmd to use composer and nodejs modules on Windows.
*	Add tests