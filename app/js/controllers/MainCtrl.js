/**
 * @author Valéry Herlaud
 */

angular.module('sfc').controller('MainCtrl', function ($scope, $location, config) {

	'use strict';

	var sep = require('path').sep,
		router = process.cwd() + sep + 'phpserver' + sep + 'router.php',
		spawn = require('child_process').spawn,
		//        ansi = require('ansi-html-stream'),
		gui = require('nw.gui'),
		link = gui.Shell.openExternal,

		// Native windows
		nativeWindow = gui.Window.get(),
		devTools,

		// Terminal
		terminalElement = document.getElementById('terminal'),
		terminalProcess,
		terminalHistory = [],
		terminalHistoryMaxLength = 20,
		terminalHistoryCurrentIndex = 0,
		command,

		//        ansiPipe,

		serverRoot = config.folder + sep + 'web',
		serverElement = document.getElementById('server'),
		serverProcess,
		serverParameters,
		serverOptions;

	if (config.folder === null) {
		$location.path('/drop');
		return;
	}

	nativeWindow.addListener('maximise', function (event) {
		console.log('maximize:', event);
	});



	//-- INITIALIZE SCOPE ------------------------------------------------------


	$scope.server = '';
	$scope.isSymfony = false;
	$scope.stdout = '';
	$scope.html = '';
	$scope.folder = config.folder;
	$scope.terminal = function () {};
	$scope.openFolder = openFolder(config.folder);
	$scope.onkeypress = keyPressHandler;

	$scope.go = function (path) {
		dispose();
		nativeWindow = undefined;
		$location.path(path);
	};

	$scope.showRoot = function () {
		link('http://localhost/');
	};

	$scope.showProd = function () {
		link('http://localhost/');
	};

	$scope.showDev = function () {
		link('http://localhost/app_dev.php');
	};

	$scope.close = function () {
		gui.App.quit();
	};

	$scope.minimize = function () {
		nativeWindow.minimize();
	};

	$scope.maximize = function () {
		nativeWindow.toggleFullscreen();
	};

	$scope.devtools = function () {
		if (devTools) {
			devTools.close();
			devTools = undefined;
		} else {
			devTools = nativeWindow.showDevTools();
			devTools.moveTo(nativeWindow.x, nativeWindow.y + nativeWindow.height);
		}
	};

	$scope.reload = function () {
		dispose();
		nativeWindow.reload();
		nativeWindow = undefined;
	};



	//-- OPEN FOLDER -----------------------------------------------------------


	function openFolder(folder) {
		return function () {
			gui.Shell.openExternal(folder);
		};
	}


	//-- SERVER ----------------------------------------------------------------

	serverParameters = ['-S', 'localhost:80', router];

	serverOptions = {
		cwd: serverRoot,
		env: process.env,
		detached: false,
		stdio: ['pipe', 'pipe', 'pipe']
	};


	// Try classic symfony configuration
	try {

		serverProcess = spawn('php', serverParameters, serverOptions);
		serverProcess.addListener('close', serverCloseHandler);
		serverProcess.addListener('error', serverErrorHandler);

		serverProcess.stdout.addListener('data', serverDataHandler);
		serverProcess.stderr.addListener('data', serverDataHandler);

		$scope.server += '[READY] As Symfony2 project';
		$scope.isSymfony = true;

	} catch (error) {


		// Try default configuration
		try {

			serverOptions.cwd = config.folder;
			serverProcess = spawn('php', serverParameters, serverOptions);
			serverProcess.addListener('close', serverCloseHandler);
			serverProcess.addListener('error', serverErrorHandler);

			serverProcess.stdout.addListener('data', serverDataHandler);
			serverProcess.stderr.addListener('data', serverDataHandler);

			$scope.server += '[READY] As simple server.';

		} catch (error) {
			$scope.server += '[ERROR] Server can\'t be launch. PHP 5.4 is needed and must be in your system path.';
		}


	}


	function serverDataHandler(data) {
		$scope.$apply(function () {
			$scope.server += data;
		});
		serverElement.scrollTop = serverElement.scrollHeight * 2;
	}

	function serverCloseHandler(code) {
		$scope.$apply(function () {
			$scope.server += '[CLOSE] ' + code;
		});
		serverElement.scrollTop = serverElement.scrollHeight * 2;
	}

	function serverErrorHandler(error) {
		$scope.$apply(function () {
			$scope.server += '[ERROR] ' + error;
		});
		serverElement.scrollTop = serverElement.scrollHeight * 2;
	}



	//-- TERMINAL --------------------------------------------------------------


	//commandHandler('php app/console');

	// KEYPRESS

	function keyPressHandler($event) {

		var target = $event.target,
			value = target.value;

		// KILL

		if ($event.keyCode === 67 && $event.ctrlKey === true) {
			if (terminalProcess) {
				terminalProcess.kill();
				terminalProcess = undefined;
			}

			target.value = '';

			// NEW LINE

		} else if (value && $event.keyCode === 13) {

			commandHandler(value);

			terminalHistory.push(value);

			if (terminalHistory.length > terminalHistoryMaxLength) {
				terminalHistory.shift();
			}

			terminalHistoryCurrentIndex = terminalHistory.length;

			target.value = '';


			// ARROWS

		} else if (terminalHistory.length !== 0) {


			// ARROW UP

			if ($event.keyCode === 38) {

				$event.preventDefault();
				terminalHistoryCurrentIndex = Math.max(0, terminalHistoryCurrentIndex - 1);

				target.blur();
				target.value = terminalHistory[terminalHistoryCurrentIndex];
				target.focus();


				// ARROW DOWN

			} else if ($event.keyCode === 40) {

				if (terminalHistoryCurrentIndex <= terminalHistory.length) {
					terminalHistoryCurrentIndex = Math.min(terminalHistory.length - 1, terminalHistoryCurrentIndex + 1);
					target.value = terminalHistory[terminalHistoryCurrentIndex];
				}
			}
		}


	}


	// COMMANDS

	function commandHandler(value) {

		var parameters,
			options;

		if (terminalProcess) {
			terminalProcess.stdin.write(value + '\n');

		} else {

			if (value === 'clear') {
				$scope.stdout = '';
				return;
			}

			pushDataToScope(value, true);

			parameters = value.split(' ');
			command = parameters.shift();

			if (command === 'sf') {
				command = 'php';
				parameters.splice(0, 0, 'app/console');
			}

			options = {
				cwd: config.folder,
				env: process.env,
				detached: false,
				stdio: ['pipe', 'pipe', 'pipe']
			};

			try {
				terminalProcess = spawn(command, parameters, options);
				terminalProcess.addListener('close', terminalCloseHandler);
				setSocket(terminalProcess.stdin);
				setSocket(terminalProcess.stdout);
				setSocket(terminalProcess.stderr);

				//                ansiPipe = ansi({chunked: false});
				//                ansiPipe.addListener('data', function(data) {
				//                    $scope.$apply(function() {
				//                        $scope.html += data;
				//                    });
				//                });
				//
				//                terminalProcess.stdout.pipe(ansiPipe);
				//                terminalProcess.stderr.pipe(ansiPipe);

			} catch (error) {
				pushDataToScope(error);
			}
		}

		function setSocket(socket) {
			socket.setEncoding('ascii');
			socket.addListener('data', terminalDataHandler);
			socket.addListener('timeout', terminalSocketTimeoutHandler);
			socket.addListener('drain', terminalSocketDrainHandler);
			socket.addListener('error', terminalSocketErrorHandler);
		}

	}


	function pushDataToScope(data, isTerminalCommand) {
		$scope.stdout += '\n' + (isTerminalCommand === true ? config.folder + ' > ' : '') + data;
		terminalElement.scrollTop = terminalElement.scrollHeight * 2;
	}


	function terminalCloseHandler(code) {
		terminalDataHandler('[EXIT] ' + command + ' > "' + code + '" given.', true);
		terminalElement.scrollTop = terminalElement.scrollHeight * 2;
		disposeTerminalProcess();
	}



	//-- SOCKETS EVENTS HANDLERS -----------------------------------------------


	function terminalDataHandler(data) {
		$scope.$apply(function () {
			pushDataToScope(data);
		});
		terminalElement.scrollTop = terminalElement.scrollHeight * 2;
	}

	function terminalSocketTimeoutHandler() {
		terminalDataHandler('TIMEOUT', arguments, this);
	}

	function terminalSocketDrainHandler() {
		terminalDataHandler('DRAIN', arguments, this);
	}

	function terminalSocketErrorHandler() {
		terminalDataHandler('ERROR', arguments, this);
	}



	//-- DISPOSE ---------------------------------------------------------------


	function dispose() {
		disposeServer();
		disposeTerminalProcess();
		disposeNativeWindow();
		devTools = undefined;
	}

	function disposeServer() {
		if (serverProcess) {
			serverProcess.removeAllListeners();
			serverProcess.kill();

			disposeSocket(serverProcess.stdin);
			disposeSocket(serverProcess.stdout);
			disposeSocket(serverProcess.stderr);

			serverProcess = undefined;
		}
	}

	function disposeTerminalProcess() {
		if (terminalProcess) {
			terminalProcess.removeAllListeners();
			terminalProcess.kill();

			disposeSocket(terminalProcess.stdin);
			disposeSocket(terminalProcess.stdout);
			disposeSocket(terminalProcess.stderr);

			terminalProcess = undefined;
		}
	}

	function disposeSocket(socket) {
		socket.removeAllListeners();
		socket.destroy();
	}

	function disposeNativeWindow() {
		nativeWindow.removeAllListeners();
	}
});