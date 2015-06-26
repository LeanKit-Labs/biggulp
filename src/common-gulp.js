var gutil = require( "gulp-util" );
var pkg = require( "../package.json" );
var help = require( "./help" );

function calColWidth( x ) {
	return x.map( function( s ) {
			return s.length;
		} ).sort( function( a, b ) {
			return b - a;
		} )[0] + 1;
}

function padCol( col, len ) {
	return col + new Array( len - col.length ).join( " " );
}

module.exports = function( gulp, cfg ) {
	var tasks;
	var bg = require( "./index" )( gulp, cfg );

	function addTasksWithDescription( config ) {
		tasks = config;
		Object.keys( config ).forEach( function( taskNm ) {
			var args = [ taskNm ];
			var task = config[ taskNm ];
			if ( task.deps ) {
				args.push( task.deps );
			}
			if ( task.fn ) {
				args.push( task.fn );
			}
			gulp.task.apply( gulp, args );
		} );
	}

	addTasksWithDescription( {
		"continuous-test": {
			description: "Runs all tests in a watch-friendly manner.",
			fn: function() {
				bg.testAll();
			}
		},
		coverage: {
			description: "Runs test coverage report & displays in the console.",
			deps: [ "format" ],
			fn: function() {
				bg.withCoverage();
			}
		},
		"coverage-watch": {
			description: "Continuously runs console-based test coverage report in watch mode.",
			deps: [ "coverage" ],
			fn: function() {
				bg.watch( [ "coverage" ] );
			}
		},
		default: {
			description: "Runs the coverage report, and then kicks off coverage-watch",
			deps: [ "coverage", "coverage-watch" ]
		},
		format: {
			description: "Runs format linting and fixing.",
			deps: [ "jshint" ],
			fn: function() {
				return bg.format();
			}
		},
		help: {
			description: "I need somebody. HELP! Not just anybody. HELP! You know I need someone...",
			fn: function() {
				gutil.log( help.banner() );
				gutil.log( gutil.colors.white( "--------------------------------------" ) );
				gutil.log( gutil.colors.white( "   biggulp", "v" + pkg.version, "- Available Tasks" ) );
				gutil.log( gutil.colors.white( "--------------------------------------" ) );
				var taskNames = Object.keys( tasks );
				var colLen = calColWidth( taskNames );
				taskNames.forEach( function( taskNm ) {
					var task = tasks[taskNm];
					var msg = gutil.colors.green( padCol( taskNm, colLen ), "- " );
					msg += gutil.colors.blue( task.description );
					if ( task.deps ) {
						msg += gutil.colors.yellow( " (depends on:", task.deps + ")" );
					}
					gutil.log( msg );
				} );
			}
		},
		jshint: {
			description: "Lints your code. Warning: It might hurt your feelings. See Doug Crockford for free hugs.",
			fn: function() {
				return bg.lint();
			}
		},
		"show-coverage": {
			description: "Runs test coverage and opens the browser-based coverage report. Great brain candy.",
			fn: function() {
				return bg.showCoverage();
			}
		},
		test: {
			description: "Alias for the test-watch task.",
			deps: [ "test-watch" ]
		},
		"test-and-exit": {
			description: "Runs all tests and exits.",
			fn: function() {
				bg.testAllOnce();
			}
		},
		"test-behavior": {
			description: "Runs behavior tests.",
			fn: function() {
				bg.testBehavior();
			}
		},
		"test-int": {
			description: "Runs integration tests.",
			fn: function() {
				bg.testIntegration();
			}
		},
		"test-watch": {
			description: "Continuously runs all tests in watch mode.",
			deps: [ "continuous-test" ],
			fn: function() {
				bg.watch( [ "continuous-test" ] );
			}
		}
	} );
	return bg;
};
