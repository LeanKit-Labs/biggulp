var gulp;
var open = require( 'open' ); //jshint ignore : line
var processhost = require( 'processhost' )();
var when = require( 'when' );
var _ = require( 'lodash' );
var path = require( 'path' );
var mocha = require( 'gulp-spawn-mocha' );
var cmdPostfix = process.platform === 'win32' ? '.cmd' : '';
var defaultSources = [ './src/**/*.js', './resource/**/*.js' ];
var defaultSpecPath = [ './spec' ];
var defaultSpecs = [ '**/*.spec.js' ];
var defaultWatchPaths = [ './src/**/*', './spec/**/*', './resource/**/*' ];
var processesDefined = false;

process.on( 'uncaughtError', console.log );

function cover( specPath, show ) {
	var args = Array.prototype.slice.call( arguments, 2 ) || [];
	args.unshift( specPath, true );
	return function( /* cb */ ) {
		return runSpecs.apply( undefined, args )
			.on( 'end', function() {
				if ( show ) {
					open( './coverage/lcov-report/index.html' );
					process.exit();
				}
			} );
	};
}

function groklate( ngrok, subdomain, port, token ) {
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

function runSpecs( specPath, coverage ) {
	var args = Array.prototype.slice.call( arguments, 2 );
	if ( args.length === 0 ) {
		args = [ defaultSpecs ];
	}
	var joinArgs = _.flatten( args );
	var specs = _.reduce( joinArgs, function( acc, spec ) {
		_.each( specPath, function( p ) {
			acc.push( path.join( p, spec ) );
		} );
		return acc;
	}, [] );
	var specExclude = _.map( specPath, function ( p ) {
		return path.join( p, '**/*' );
	} );
	return gulp
		.src( specs, { read: false } )
		.pipe( mocha( { R: 'spec', istanbul: coverage ? {
			x: specExclude
		} : false } ) );
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

module.exports = function( gulpRef, specPath, watchPaths ) {
	gulp = gulpRef;
	specPath = specPath || defaultSpecPath;
	watchPaths = watchPaths || defaultWatchPaths;
	init();
	return {
		cover: cover,
		ngrok: groklate,
		process: setupProcess,
		processes: setupProcesses,
		showCoverage: cover.bind( undefined, specPath, true ),
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
		withCoverage: cover.bind( undefined, specPath, false ),
	};
};
