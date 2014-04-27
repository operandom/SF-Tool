/**
 * @author Valéry Herlaud
 */

angular.module('sfc').controller('DropCtrl', function ($scope, session) {

	'use strict';

	$scope.folder = session.folder;

});