var _ = require( "lodash" );
var when = require( "when" );
var open = require( "open" );
var path = require( "path" );
var mocha = require( "gulp-spawn-mocha" );
var processhost = require( "processhost" )();
var cmdPostfix = process.platform === "win32" ? ".cmd" : "";
var defaults = {
	allSpecPaths: [ "./spec" ],
	behaviorSpecPaths: [ "./spec/behavior" ],
	integrationSpecPaths: [ "./spec/integration" ],
	specs: [ "**/*.spec.js" ],
	watchPaths: [ "./src/**/*", "./spec/**/*", "./resource/**/*" ],
	sources: [ "*.js", "{resource,src,spec}/**/*.js" ],
	coverageHtml: "./coverage/lcov-report/index.html",
	jscsCfgPath: ".jscsrc"
};
var jshint = require( "gulp-jshint" );
var jscs = require( "gulp-jscs" );
var gutil = require( "gulp-util" );
var gulpChanged = require( "gulp-changed" );
var stylish = require( "jshint-stylish" );
var BABEL_ISTANBUL_PATH = path.join( path.dirname( require.resolve( "babel-istanbul" ) ), "lib/cli.js" );

function permuPath( dirs, globs ) {
	return _.reduce( globs, function( accum, glb ) {
		Array.prototype.push.apply(
			accum,
			_.map( dirs, function( dir ) {
				return path.join( dir, glb );
			} )
		);
		return accum;
	}, [] );
}

module.exports = function( gulpRef, cfg ) {
	var gulp = require( "gulp-help" )( gulpRef, {
		aliases: [ "?" ]
	} );
	var options = _.defaults( cfg || {}, defaults );
	var processesDefined = false;

	function runSpecs( testCfg ) {
		var mochaOpts = {
			R: "spec",
			istanbul: testCfg.coverage ? {
				x: testCfg.coverageExclude,
				// If esnext then we tell gulp-spawn-mocha to use babel-istanbul for coverage
				bin: options.esnext ? BABEL_ISTANBUL_PATH : false
			} : false
		};
		if ( options.esnext && !testCfg.coverage ) {
			mochaOpts.compilers = [ "js:babel-register" ];
		}
		return gulp.src( testCfg.specs, { read: false } )
			.pipe( mocha( mochaOpts ) );
	}

	function test( specs ) {
		specs = specs || defaults.specs;
		return runSpecs( {
			specs: _.isArray( specs ) ? specs : [ specs ]
		} );
	}

	function testOnce( specs ) {
		return test( specs )
			.on( "end", process.exit.bind( process, 0 ) )
			.on( "error", process.exit.bind( process, 100 ) );
	}

	function testAll( opt ) {
		var _opt = opt || options;
		var specs = permuPath( _opt.allSpecPaths, _opt.specs );
		var coverageExclude = permuPath( _opt.allSpecPaths, [ "**/*" ] );
		return runSpecs( {
			specs: specs,
			coverageExclude: coverageExclude,
			coverage: _opt.coverage
		} ).on( "error", _.noop );
	}

	function testAllAndExit( opt ) {
		return testAll( opt )
			.on( "end", process.exit.bind( process, 0 ) )
			.on( "error", process.exit.bind( process, 100 ) );
	}

	function testBehavior( opt ) {
		var _opt = opt || options;
		var specs = permuPath( _opt.behaviorSpecPaths, _opt.specs );
		var coverageExclude = permuPath( _opt.allSpecPaths, [ "**/*" ] );
		return runSpecs( {
			specs: specs,
			coverageExclude: coverageExclude,
			coverage: _opt.coverage
		} );
	}

	function testBehaviorAndExit( opt ) {
		return testBehavior( opt )
			.on( "end", process.exit.bind( process, 0 ) )
			.on( "error", process.exit.bind( process, 100 ) );
	}

	function testIntegration( opt ) {
		var _opt = opt || options;
		var specs = permuPath( _opt.integrationSpecPaths, _opt.specs );
		var coverageExclude = permuPath( _opt.allSpecPaths, [ "**/*" ] );
		return runSpecs( {
			specs: specs,
			coverageExclude: coverageExclude,
			coverage: _opt.coverage
		} );
	}

	function testIntegrationAndExit( opt ) {
		return testIntegration( opt )
			.on( "end", process.exit.bind( process, 0 ) )
			.on( "error", process.exit.bind( process, 100 ) );
	}

	function cover( opt ) {
		var _opt = opt || _.clone( options );
		_opt.coverage = true;
		return testAll( _opt );
	}

	function showCoverage( opt ) {
		var _opt = opt || _.clone( options );
		_opt.coverage = true;
		return testAll( opt ).on( "end", function() {
			open( _opt.coverageHtml );
			process.exit();
		} );
	}

	function setupProcess( processName, opts ) {
		processesDefined = true;
		return processhost.start( processName, {
			command: opts.command || opts.cmd || "node" + cmdPostfix,
			args: opts.arguments || opts.args || [],
			stdio: opts.stdio || "inherits",
			restart: opts.restart
		} );
	}

	function setupProcesses( opts ) {
		processesDefined = true;
		return processhost.setup( opts );
	}

	function groklate( ngrok, opts ) {
		if ( !opts && !options.ngrok ) {
			throw new Error( "To use ngrok you must supply an options argument containing port, subdomain and token" );
		}
		var _opt = opts || options.ngrok;
		return when.promise( function( resolve, reject ) {
			ngrok.connect( {
				port: _opt.port,
				subdomain: _opt.subdomain,
				authtoken: _opt.token
			}, function( err, url ) {
					if ( err ) {
						reject( err );
					} else {
						resolve( url );
					}
				} );
		} );
	}

	function watch( opt, tasks ) {
		var _tasks;
		var _opt;
		if ( arguments.length === 1 ) {
			_opt = options;
			_tasks = opt;
		} else {
			_opt = opt;
			_tasks = tasks;
		}
		if ( processesDefined ) {
			_tasks.concat( "restartProcesses" );
		}
		return gulp.watch( _opt.watchPaths, _tasks );
	}

	function format( opt ) {
		var _opt = opt || options;
		return gulp.src( _opt.sources )
			.pipe( jscs( {
				configPath: _opt.jscsCfgPath,
				fix: true
			} ) )
			.on( "error", function( error ) {
				gutil.log( gutil.colors.red( error.message ) );
				this.end();
			} )
			.pipe( gulpChanged( ".", { hasChanged: gulpChanged.compareSha1Digest } ) )
			.pipe( gulp.dest( "." ) );
	}

	function lint( opt ) {
		var _opt = opt || options;
		return gulp.src( _opt.sources )
			.on( "error", function( error ) {
				gutil.log( gutil.colors.red( error.message + " in " + error.fileName ) );
				this.end();
			} )
			.pipe( jshint() )
			.pipe( jshint.reporter( stylish ) )
			.pipe( jshint.reporter( "fail" ) );
	}

	gulp.task( "restartProcesses", function( cb ) {
		processhost.restart()
			.then( function() {
				cb();
			}, function( err ) {
				cb( err );
			} );
	} );

	return {
		cover: cover,
		ngrok: groklate,
		process: setupProcess,
		setupProcesses: setupProcesses,
		showCoverage: showCoverage,
		test: test,
		testOnce: testOnce,
		testAll: testAll,
		testAllOnce: testAllAndExit,
		testBehavior: testBehavior,
		testBehaviorOnce: testBehaviorAndExit,
		testIntegration: testIntegration,
		testIntegrationOnce: testIntegrationAndExit,
		watch: watch,
		withCoverage: cover,
		format: format,
		lint: lint
	};
};
