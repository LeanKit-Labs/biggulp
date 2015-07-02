var about = require( "./about" );

module.exports = function( gulp, cfg ) {
	var tasks;
	var bg = require( "./index" )( gulp, cfg );

	function addTasksWithDescription( config ) {
		tasks = config;
		Object.keys( config ).forEach( function( taskNm ) {
			var args = [ taskNm ];
			var task = config[ taskNm ];
			if ( task.description ) {
				args.push( task.description );
			}
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
		about: {
			description: "Where'd all these tasks come from?",
			fn: function() {
				about.print();
			}
		},
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
			description: "Alias for the coverage task.",
			deps: [ "coverage" ]
		},
		"test-and-exit": {
			description: "Runs all tests and exits.",
			deps: [ "jshint" ],
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
