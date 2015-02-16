## biggulp
Features and utilities to simplify advanced gulpfiles.

## Features

 * Mocha test runner
 * Istanbul code coverage - both console report & browser report features
 * Simplified file watching
 * Ability to start/restart companion processes required for tests
 * Ngrok integration

## Defaults / Conventions

 * default sources: 		[ './src/**/*.js', './resource/**/*.js' ]
 * default spec path: 		'./spec'
 * default specs: 			[ '**/*.spec.js' ]
 * default watch paths:		[ './src/**/*', './spec/**/*', './resource/**/*' ]

## Setup

### require( 'biggulp' )( gulp, [sources], [specPath], [watchPaths] )
A reference to the gulp instance in your gulpfile must always be passed as the first argument. Each of the following arguments overrides one of the defaults.

```js
var gulp = require( 'gulp' );
var bg = require( 'biggulp' )( gulp )
```

## Mocha
The coverage tasks will handle setting this up for you.

### bg.test( [ testGlob ] )
Specify the test pattern to use after the default/root spec path. Default is '**/*.spec.js'.

```js
gulp.task( 'specs', function() {
	return bg.test( './spec/justThisSpec.js' );
} );
```

### bg.testOnce( [ testGlob ] )
Specify the test pattern to use after the default/root spec path. Default is '**/*.spec.js'. Works like `test` except it will exit with a 0 exit code if all tests pass and > 0 if any fail.

```js
gulp.task( 'specs', function() {
	return bg.testOnce( './spec/justThisSpec.js' );
} );
```

## Watchers

## Istanbul

### bg.withCoverage( [ testGlob ] )
Works like `test` but adds a console report showing test coverage as measured by Istanbul.

```js
gulp.task( 'coverage', bg.withCoverage() );
```

### bg.showCoverage( [ testGlob ] )
Just like `withCoverage` but also displays the browser report and then exits the process.

```js
gulp.task( 'show-coverage', bg.showCoverage() );
```

## Ngrok
Ngrok is a great tunneling service that allows you to expose a local service publicly for testing. You can use a free version which doesn't guarantee your subdomain, or use a paid version and claim your subdomain!

### bg.ngrok( subdomain, port, token )
Sets up an ngrok tunnel and returns a promise which resolving to the public url when the tunnel is ready. All arguments are required.

```js
bg.grok( 'mahDomain', 8800, 'anToken' )
	.then( function( url ) {
		console.log( 'Tunneling', url, 'to 8800' );
	} );
```

## process hosting
Uses [processhost](https://github.com/leankit-labs/processhost) to start/restart processes.

### bg.process( name, options )
Use when you only need to manage a single process along with your test runs. Returns a promise that resolves on process start. If you're using watch tasks, `biggulp` will restart any processes defined this way for you on file changes.

> Note: processes with the `restart` option set to false will not restart on file changes.

```js
bg.process( 'redis', { cmd: 'redis-server', stdio: 'ignore', restart: false } )
	.then( function() {
		// everything is ready to go
	} );
```

### bg.processes( processHash )
Use when you need several processes. Returns a promise that resolves after all processes start. Note: if you're using watch tasks, `biggulp` will restart all processes defined this way for you on file changes.

```js
bg.processes(
	{
		server: { args: [ './src/index.js' ] },
		redis: { cmd: 'redis-server', stdio: 'ignore', restart: false }
	} )
	.then( function() {
		// everything is ready to go
	} )
```

## Example
This example shows the following combinations:

 * `build` - run the tests and exit with 0 for success > 0 for failure
 * `specs` - continuously re-run specs on change
 * `default` - continuously re-run specs on change and display coverage in console
 * `show-coverage` - runs the specs and opens the browser to a coverage report


 ```js
var gulp = require( 'gulp' );
// uses default paths
var bg = require( 'biggulp' )();

// a task to pass default tests to istanbul
// results in a coverage report at the end of
// test run
gulp.task( 'coverage', bg.withCoverage() );

// a watch task against default paths and
// run the coverage task on file changes
gulp.task( 'coverage-watch', function() {
	bg.watch( [ 'coverage' ] );
} );

// open a browser after the test run and exit
gulp.task( 'show-coverage', bg.showCoverage() );

// just run the specs via mocha
gulp.task( 'continuous-specs', function() {
	return bg.test();
} );

// sets up a watch on default paths and
// runs the `continuous-specs` task on file change
gulp.task( 'specs-watch', function() {
	bg.watch( [ 'continuous-specs' ] );
} );

// run specs and exit with a code to indicate pass/fail
gulp.task( 'test-and-exit', function() {
	return bg.testOnce();
} );

gulp.task( 'default', [ 'coverage', 'coverage-watch' ], function() {} );
gulp.task( 'specs', [ 'continuous-specs', 'specs-watch' ], function() {} );
gulp.task( 'build', [ 'test-and-exit' ] );
 ```
