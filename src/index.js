// var gulp = require( 'gulp' );
var mocha = require( 'gulp-mocha' );
var istanbul = require( 'gulp-istanbul' );
var open = require( 'open' ); //jshint ignore : line
var ngrok = require( 'ngrok' );
var processhost = require( 'processhost' )();
var esformatter = require( 'gulp-esformatter' );
var when = require( 'when' );
var _ = require( 'lodash' );
var path = require( 'path' );
var gulp = require( 'gulp' );

var cmdPostfix = process.platform === 'win32' ? '.cmd' : '';
var defaultSources = [ './src/**/*.js', './resource/**/*.js' ];
var defaultSpecPath = [ './spec' ];
var defaultSpecs = [ '**/*.spec.js' ];
var defaultWatchPaths = [ './src/**/*', './spec/**/*', './resource/**/*' ];
var processesDefined = false;

process.on( 'uncaughtError', console.log );

function cover( sources, show ) {
	var args = Array.prototype.slice.call( arguments, 2 ) || [];
	return function( cb ) {
		return gulp.src( sources )
			.pipe( istanbul() )
			.pipe( istanbul.hookRequire() )
			.on( 'finish', function() {
				writeReport( cb, show, runSpecs.apply( undefined, args ) );
			} );
	};
}

function format( sources, targets ) {
	return gulp.src( sources )
		.pipe( esformatter() )
		.pipe( gulp.dest( targets ) );
}

function groklate( subdomain, port, token ) {
	return when.promise( function( resolve, reject ) {
		ngrok.connect( {
			port: port,
			subdomain: subdomain,
			authtoken: token
		}, function( err, url ) {
				if ( err ) {
					reject( err );
				} else {
					resolve( url );
				}
			} );
	} );
}

function init() {
	gulp.task( 'restartProcesses', function( cb ) {
		processhost.restart()
			.then( function() {
				cb();
			}, function( err ) {
					cb( err );
				} );
	} );
}

function runSpecs( specPath ) {
	var args = Array.prototype.slice.call( arguments, 1 );
	if ( args.length === 0 ) {
		args = [ defaultSpecs ];
	}
	var joinArgs = _.flatten( [ specPath ].concat( args ) );
	var specs = path.join.apply( path, joinArgs );
	return gulp.src( [ specs ], { read: false } )
		.pipe( mocha( { reporter: 'spec' } ) );
}

function setupProcess( processName, opts ) {
	processesDefined = true;
	return processhost.startProcess( processName, {
		command: opts.command || opts.cmd || 'node' + cmdPostfix,
		args: opts.arguments || opts.args || [],
		stdio: opts.stdio || 'inherits',
		restart: opts.restart
	} );
}

function setupProcesses( opts ) {
	processesDefined = true;
	return processhost.setup( opts );
}

function testAndExit() {
	var args = Array.prototype.slice.call( arguments );
	return runSpecs.apply( undefined, args )
		.on( 'end', process.exit.bind( process, 0 ) )
		.on( 'error', process.exit.bind( process, 100 ) );
}

function watch( paths, tasks ) {
	tasks = processesDefined ? tasks.concat( 'restartProcesses' ) : tasks;
	return gulp.watch( paths, tasks.concat( tasks ) );
}

function writeReport( cb, openBrowser, tests ) {
	return tests
		.on( 'error', function( e ) {
			console.log( 'error occurred during testing', e.stack );
		} )
		.pipe( istanbul.writeReports() )
		.on( 'end', function() {
			if ( openBrowser ) {
				open( './coverage/lcov-report/index.html' );
				process.exit();
			}
		} );
}

module.exports = function( sources, specPath, watchPaths ) {

	sources = sources || defaultSources;
	specPath = specPath || defaultSpecPath;
	watchPaths = watchPaths || defaultWatchPaths;
	init();
	return {
		cover: cover,
		format: format,
		ngrok: groklate,
		process: setupProcess,
		processes: setupProcesses,
		showCoverage: cover.bind( undefined, sources, true, specPath ),
		testOnce: testAndExit.bind( undefined, specPath ),
		test: runSpecs.bind( undefined, specPath ),
		watch: function() {
			var args = Array.prototype.slice.call( arguments );
			if ( args.length > 1 ) {
				return watch( args[ 0 ], args[ 1 ] );
			} else {
				return watch( watchPaths, args[ 0 ] );
			}
		},
		withCoverage: cover.bind( undefined, sources, false, specPath ),
	};
};
