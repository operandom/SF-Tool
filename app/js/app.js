/**
 * @author Valéry Herlaud
 */

(function () {

	'use strict';

	console.groupCollapsed('version');
	console.log('node-webkit', process.versions['node-webkit']);
	console.log('node', process.version);
	console.log('webkit', window.navigator.appVersion.match(/Chrome\/(.*?) /)[1]);
	console.log('angular', angular.version.full);
	console.groupEnd();

	var fs = require('fs'),
		sep = require('path').sep,
		gui = require('nw.gui'),
		nativeWindow = gui.Window.get(),
		isMaximize,
		isMinimize
		;


	// MODULE

	angular.module('sfc', ['ngRoute'])


	// FOLDER

	.value('config', {
		routeur: process.cwd() + sep + 'phpserver' + sep + 'router.php'
	})

	.value('session', {
		folder: null
	})

	.directive('droppable', function ($location, session) {

		return {
			restrict: 'A',
			link: function ($scope, $element) {

				$element.bind('drop', function (event) {
					var directory = event.dataTransfer.files[0].path;

					if (fs.lstatSync(directory).isDirectory()) {
						session.folder = directory;
						$location.path('/');
						$scope.$apply();
					} else {
						$element.removeClass('dragOver');
					}
				});

				$element.bind('dragover', function () {
					$element.addClass('dragOver');
				});

				$element.bind('dragleave', function () {
					$element.removeClass('dragOver');
				});
			}
		};

	})


	// CONFIG

	.config(function ($routeProvider) {


		nativeWindow.on('maximize', function () {
			isMaximize = true;
		});

		nativeWindow.on('unmaximize', function () {
			isMaximize = false;
		});

		nativeWindow.on('minimize', function () {
			isMinimize = true;
		});

		nativeWindow.on('restore', function () {
			isMinimize = false;
		});

		//initializeTerminal();

		$routeProvider

		.when('/', {
			controller: 'MainCtrl',
			templateUrl: 'views/mainView.html'
		})

		.when('/drop', {
			controller: 'DropCtrl',
			templateUrl: 'views/dropView.html'
		})

		;

	});
})();