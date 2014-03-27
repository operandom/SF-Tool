SF Tool
=======

A tool for Symfony2 projects.

![web preview] (resources/images/screen-main.png?raw=true)

![web preview] (resources/images/screen-drop.png?raw=true)

Requirements
------------

SF tool needs PHP 5.4 to be installed on your system and be present in your PATH environment variable to launch the server automatically.


Installation
------------

Uncompress the release archive where you want it.


Usage
-----

Launch the application. Drop a folder.


**SF Tool's internal commands:**

*	**`sf`** Shortcut for `php app/console`.
*	**`clear`** Clean the terminal.


@TODO
-----

*	Open last folder on startup.

*	Add router for clean urls : `localhost/dev/` instead of `localhost/app_dev.php/`, etc.

*	Add choice list of available commands.

*	Make a global menu bar.

*	Make a real teminal (color, no input in the bottom, color, etc).

*	Add keyword/shortcut system.

*	Add capability to save preferences.

*	Add a theme system.

*	Make ".bat" and ".cmd" work in terminal on Windows.
	Currently you need to launch cmd to use composer and nodejs modules on Windows.
	
*	Add tests