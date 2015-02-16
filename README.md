## biggulp
Features and utilities to simplify advanced gulpfiles.

## Features

 * Mocha test runner
 * Istanbul code coverage - both console report & browser report features
 * File watching
 * Ability to start/restart companion processes required for tests
 * Ngrok integration

## Defaults / Conventions
All of these can be changed, but without providing specific values for them, theses are `biggulp`'s defaults:

 * default sources: 		`[ './src/**/*.js', './resource/**/*.js' ]`
 * default spec path: 		`'./spec'`
 * default specs: 			`[ '**/*.spec.js' ]`
 * default watch paths:		`[ './src/**/*', './spec/**/*', './resource/**/*' ]`

## Setup

### require( 'biggulp' )( gulp, [sources], [specPath], [watchPaths] )
A reference to the gulp instance in your gulpfile must always be passed as the first argument. Each of the following arguments overrides one of the defaults.

```js
var gulp = require( 'gulp' );
var bg = require( 'biggulp' )( gulp )
```

## Mocha
Runs specifications via Mocha.

### bg.test( [ testGlob ] )
Run tests that match `testGlob` - the test pattern to use (relative to the default/root spec path). Default is `'**/*.spec.js'`.

```js
gulp.task( 'specs', function() {
	return bg.test( './spec/justThisSpec.js' );
} );
```

### bg.testOnce( [ testGlob ] )
Like `test` except it uses an exit code to indicate pass/fail (0 pass, >0 fail).

```js
gulp.task( 'specs', function() {
	return bg.testOnce( './spec/justThisSpec.js' );
} );
```

## Watchers

### bg.watch( [watchGlobs], tasks )
Creates a file watcher for the patterns specified (defaults to `[ './src/**/*', './spec/**/*', './resource/**/*' ]` ) and executes the array of tasks when a file changes.

```js
gulp.task( 'watch', function() {
	return bg.watch( [ 'specs' ] );
} );
```

## Istanbul
[Istanbul](https://github.com/gotwarlost/istanbul) is a great library that provides code coverage metrics. Use it, you won't be sorry.

### bg.withCoverage( [ testGlob ] )
Works like `test` but adds a console report showing test coverage as measured by Istanbul.

```js
gulp.task( 'coverage', bg.withCoverage() );
```

### bg.showCoverage( [ testGlob ] )
Like `withCoverage` but also displays the browser report and then exits the process.

```js
gulp.task( 'show-coverage', bg.showCoverage() );
```

## Ngrok
[Ngrok](https://ngrok.com/) is a tunneling service that allows you to expose a local service publicly.

> Note: the free version does not reserver/guarantee your subdomain.

### bg.ngrok( subdomain, port, token )
Sets up an ngrok tunnel and returns a promise which resolves to the public url once the tunnel is ready.

```js
bg.grok( 'mahDomain', 8800, 'anToken' )
	.then( function( url ) {
		console.log( 'Tunneling', url, 'to 8800' );
	} );
```

## process hosting
Uses [processhost](https://github.com/leankit-labs/processhost) to start/restart OS processes. See processhost README for details on options.

> Notes:

> 1. if you're using watch tasks, `biggulp` will restart __all__ processes defined this way for you on file changes.

> 2. processes with the `restart` option set to false will not restart on file changes.

### bg.process( name, options )
Use when you only need to manage a single process along with your tests. Returns a promise that resolves on process start.

```js
bg.process( 'redis', { cmd: 'redis-server', stdio: 'ignore', restart: false } )
	.then( function() {
		// everything is ready to go
	} );
```

### bg.processes( processHash )
Use when you need several processes. Returns a promise that resolves after all processes start.

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
This example has tasks that demonstrate the following "recipes":

<dl>
	<dt>build</dt>
	<dd>run the tests and exit with 0 for success > 0 for failure</dd>
	<dt>specs</dt>
	<dd>continuously re-run specs on change</dd>
	<dt>default</dt>
	<dd>continuously re-run specs on change and display coverage in console</dd>
	<dt>show-coverage</dt>
	<dd>runs the specs and opens the browser to a coverage report</dd>
</dl>


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
