var _ = require( "lodash" );
var when = require( "when" );
var open = require( "open" );
var path = require( "path" );
var mocha = require( "gulp-spawn-mocha" );
var processhost = require( "processhost" )();
var cmdPostfix = process.platform === "win32" ? ".cmd" : "";
var workingDir = process.cwd();
var fs = require( "fs" );
var defaults = {
	allSpecPaths: [ "./spec" ],
	behaviorSpecPaths: [ "./spec/behavior" ],
	integrationSpecPaths: [ "./spec/integration" ],
	specs: [ "**/*.spec.js" ],
	watchPaths: [ "./src/**/*", "./spec/**/*", "./resource/**/*" ],
	sources: [ "*.js", "{resource,src,spec}/**/*.js" ],
	coverageHtml: "./coverage/lcov-report/index.html",
	jscsCfgPath: ".jscsrc",
	linter: "auto"
};
var gulpJshint = require( "gulp-jshint" );
var jscs = require( "gulp-jscs" );
var gutil = require( "gulp-util" );
var gulpChanged = require( "gulp-changed" );
var stylish = require( "jshint-stylish" );
var NYC_PATH = path.join( path.dirname( require.resolve( "nyc" ) ), "./bin/nyc.js" );
var MOCHA_PATH = path.join( path.dirname( require.resolve( "mocha" ) ), "./bin/mocha" );
var ESLINTRC_FILES = [
	".eslintrc",
	".eslintrc.js",
	".eslintrc.json",
	".eslintrc.yml",
	".eslintrc.yaml"
].map( function( f ) {
	return path.join( workingDir, f );
} );

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
var spawn = require( "child_process" ).spawn;
function runNyc( options, testCfg ) {
	var args = [
		"--reporter=text-summary",
		"--reporter=lcov"
	];

	if ( options.esnext ) {
		args.push( "--require=babel-register" );
	}

	args.push( MOCHA_PATH, "-R", "spec" );

	args = args.concat( testCfg.specs );

	return spawn( NYC_PATH, args, {
		stdio: "inherit"
	} );
}

module.exports = function( gulpRef, cfg ) {
	var gulp = require( "gulp-help" )( gulpRef, {
		aliases: [ "?" ]
	} );
	var options = _.defaults( cfg || {}, defaults );
	var processesDefined = false;

	function runSpecs( testCfg ) {
		var mochaOpts = {
			R: "spec"
		};
		if ( options.esnext && !testCfg.coverage ) {
			mochaOpts.compilers = [ "js:babel-register" ];
		}

		if ( testCfg.coverage ) {
			return runNyc( options, testCfg, mochaOpts );
		} else {
			return gulp.src( testCfg.specs, { read: false } )
				.pipe( mocha( mochaOpts ) );
		}
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

	function jshint( opt ) {
		var _opt = opt || options;
		return gulp.src( _opt.sources )
			.on( "error", function( error ) {
				gutil.log( gutil.colors.red( error.message + " in " + error.fileName ) );
				this.end();
			} )
			.pipe( gulpJshint() )
			.pipe( gulpJshint.reporter( stylish ) )
			.pipe( gulpJshint.reporter( "fail" ) );
	}

	function eslint( opt ) {
		var _opt = opt || options;
		var gulpEslint = options.eslint || require( "gulp-eslint" );

		return gulp.src( _opt.sources )
			.pipe( gulpEslint() )
			.pipe( gulpEslint.format() )
			.pipe( gulpEslint.failAfterError() );
	}

	function hasEslintConfig() {
		var hasConfig = false;
		ESLINTRC_FILES.forEach( function( f ) {
			try {
				fs.accessSync( f );
				hasConfig = true;
				return;
			} catch ( e ) {
				return;
			}
		} );

		return hasConfig;
	}

	function lint( opt ) {
		var linterOpt = options.linter;
		var linterFn;

		if ( linterOpt === "auto" ) {
			if ( options.eslint || hasEslintConfig() ) {
				linterOpt = "eslint";
			} else {
				linterOpt = "jshint";
			}
		}

		if ( linterOpt === "eslint" ) {
			gutil.log( "Using eslint" );
			linterFn = eslint;
		} else {
			gutil.log( "Using jshint" );
			linterFn = jshint;
		}

		return linterFn( opt );
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
		lint: lint,
		jshint: jshint,
		eslint: eslint
	};
};
