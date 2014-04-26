/**
 * @author Valéry Herlaud
 */

angular.module('sfc').controller('MainCtrl', function ($scope, $location, config, session, server) {

	'use strict';

	var fs = require('fs'),
		sep = require('path').sep,
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

		serverRoot = session.folder + sep + 'web',
		serverElement = document.getElementById('server')
		;


	if (session.folder === null) {
		$location.path('/drop');
		return;
	}

	nativeWindow.addListener('maximise', function (event) {
		console.log('maximize:', event);
	});



	//-- INITIALIZE SCOPE ------------------------------------------------------


	$scope.server = '';
	$scope.isSymfony = fs.existsSync(serverRoot);
	$scope.stdout = '';
	$scope.html = '';
	$scope.folder = session.folder;
	$scope.terminal = function () {};
	$scope.openFolder = openFolder(session.folder);
	$scope.onkeypress = keyPressHandler;

	$scope.go = function (path) {
		dispose();
		nativeWindow = undefined;
		$location.path(path);
	};

	$scope.showRoot = function () {
		link(getUrl());
	};

	$scope.showProd = function () {
		link(getUrl());
	};

	$scope.showDev = function () {
		link(getUrl() + 'app_dev.php');
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



	server.on('error', function (event) {
		updateServerElement(event.type, event.error);
	});

	server.on('listening', function (event) {
		updateServerElement(event.type, event.host.address + ':' + event.host.port);
	});

	server.on('data', function (event) {
		updateServerElement(event.type, event.data);
	});

	server.on('close', function (event) {
		updateServerElement(event.type, event.code);
	});

	server.listen(
		$scope.isSymfony ? serverRoot : session.folder,
		null,
		null,
		$scope.isSymfony ? config.routeur.symfony : config.routeur.default
	);

	function updateServerElement(type, message) {
		$scope.$apply(function () {
			$scope.server += '[' + type.toUpperCase() + '] ' + message + '\n';
		});

		serverElement.scrollTop = serverElement.scrollHeight * 2;
	}


	function getUrl() {

		var address = server.address === '0.0.0.0' ? 'localhost' : server.address;

		return 'http://' + address + ':' + server.port + '/';
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
				cwd: session.folder,
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
		$scope.stdout += '\n' + (isTerminalCommand === true ? session.folder + ' > ' : '') + data;
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
		server.close();
		disposeTerminalProcess();
		disposeNativeWindow();
		devTools = undefined;
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