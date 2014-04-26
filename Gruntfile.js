module.exports = function (grunt) {

	'use strict';

	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

	var config = {
		app: 'app',
		dist: 'builds',
	};


	grunt.initConfig({

		config: config,

		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			files: [
				'Gruntfile.js',
				'<%= config.app %>/js/**/*.js',
				'!<%= config.app %>/js/vendor/*.js'
			]
		},

		nodewebkit: {
			options: {
				'build_dir': './builds',
				mac: true,
				win: true,
				linux32: true,
				linux64: true
			},
			src: ['./app/**/*']
		}

	});

	grunt.registerTask('default', [
		'jshint',
		'nodewebkit'
	]);

};