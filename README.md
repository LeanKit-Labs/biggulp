## biggulp
Features and utilities to simplify advanced gulpfiles.

## Features

 * Mocha test runner
 * Istanbul code coverage - both console report & browser report features
 * File watching
 * Ability to start/restart companion processes required for tests
 * Ngrok integration
 * JSHint
 * JSCS

## Defaults / Conventions
All of these can be changed, but without providing specific values for them, theses are `biggulp`'s defaults:

 ```javascript
{
	allSpecPaths: [ "./spec" ],
	behaviorSpecPaths: [ "./spec/behavior" ],
	integrationSpecPaths: [ "./spec/integration" ],
	specs: [ "**/*.spec.js" ],
	watchPaths: [ "./src/**/*", "./spec/**/*", "./resource/**/*" ],
	sourcePaths: [ "./src", "./resource" ],
	sources: [ "**/*.js" ],
	exclude: [ "!node_modules*" ],
	jscsCfgPath: ".jscsrc"
}
 ```

## Setup

### require( "biggulp" )( gulp, [options] )
A reference to the gulp instance in your gulpfile must always be passed as the first argument. Any properties you provide on the options argument will override its corresponding defaults.

```js
var gulp = require( "gulp" );
var bg = require( "biggulp" )( gulp );

// overriding allSpecPaths
var bg = require( "biggulp" )( gulp, { allSpecPaths: [ "./test" ] } );

```

## Mocha
Runs specifications via Mocha.

### bg.test( [ testGlob ] )
Run tests that match `testGlob` - the test pattern to use (relative to the default/root spec path). Default is `"**/*.spec.js"`.

```js
gulp.task( "specs", function() {
	return bg.test( "./spec/justThisSpec.js" );
} );
```

### bg.testOnce( [ testGlob ] )
Like `test` except it uses an exit code to indicate pass/fail (0 pass, >0 fail).

```js
gulp.task( "specs", function() {
	return bg.testOnce( "./spec/justThisSpec.js" );
} );
```
### bg.testAll( [ options ] )
Run tests that match the test pattern defined in the options' `specs` property and that fall under any of the directories listed under the options' `specPaths` array. The `options` argument allows you to pass a configuration other than what you passed to biggulp's factory to begin with.

```js
gulp.task( "test-everything", function() {
	return bg.testAll();
} );
```
### bg.testAllOnce( [ options ] )
Like `testAll` except it uses an exit code to indicate pass/fail (0 pass, >0 fail).

### bg.testBehavior( [ options ] )
Run tests that match the test pattern defined in the options' `specs` property and that fall under any of the directories listed under the options' `behaviorSpecPaths` array. The `options` argument allows you to pass a configuration other than what you passed to biggulp's factory to begin with.

```js
gulp.task( "test-behavior", function() {
	return bg.testBehavior();
} );
```
### bg.testBehaviorOnce( [ options ] )
Like `testBehavior` except it uses an exit code to indicate pass/fail (0 pass, >0 fail).

### bg.testIntegration( [ options ] )
Run tests that match the test pattern defined in the options' `specs` property and that fall under any of the directories listed under the options' `integrationSpecPaths` array. The `options` argument allows you to pass a configuration other than what you passed to biggulp's factory to begin with.

```js
gulp.task( "test-behavior", function() {
	return bg.testIntegration();
} );
```
### bg.testIntegrationOnce( [ options ] )
Like `testIntegration` except it uses an exit code to indicate pass/fail (0 pass, >0 fail).

## Watchers

### bg.watch( [ options ,] tasks )
Creates a file watcher for the patterns specified in either the global biggulp options `watchPaths` array (defaults to `[ "./src/**/*", "./spec/**/*", "./resource/**/*" ]` ) – or in the options argument's `watchPaths` array – and executes the array of tasks when a file changes.

```js
gulp.task( "watch", function() {
	return bg.watch( [ "specs" ] );
} );
```

## Istanbul
[Istanbul](https://github.com/gotwarlost/istanbul) is a great library that provides code coverage metrics. Use it, you won't be sorry.

### bg.withCoverage( [ options ] )
Works like `test` but adds a console report showing test coverage as measured by Istanbul.

```js
gulp.task( "coverage", function() {
	bg.withCoverage();
} );
```

### bg.showCoverage( [ options ] )
Like `withCoverage` but also displays the browser report and then exits the process.

```js
gulp.task( "show-coverage", function() {
	return bg.showCoverage();
} );
```

## Ngrok
[Ngrok](https://ngrok.com/) is a tunneling service that allows you to expose a local service publicly.

> Note: the free version does not reserve/guarantee your subdomain.

### bg.ngrok( ngrok [, options ] )
Sets up an ngrok tunnel and returns a promise which resolves to the public url once the tunnel is ready. You can pass the ngork options in as the `options` argument, or it will use defaults you've set when you pass options to biggulp's module factory.

> Note: the ngrok instance is required to eliminate always installing ngrok as a dependency for biggulp when not in-use.

```js
var ngrok = require( "ngrok" );

bg.grok( ngrok, { domain: "mahDomain", port: 8800, token: "anToken" } )
	.then( function( url ) {
		console.log( "Tunneling", url, "to 8800" );
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
bg.process( "redis", { cmd: "redis-server", stdio: "ignore", restart: false } )
	.then( function() {
		// everything is ready to go
	} );
```

### bg.processes( processHash )
Use when you need several processes. Returns a promise that resolves after all processes start.

```js
bg.processes(
	{
		server: { args: [ "./src/index.js" ] },
		redis: { cmd: "redis-server", stdio: "ignore", restart: false }
	} )
	.then( function() {
		// everything is ready to go
	} )
```

## Common Gulp File
We've discovered many of our node-only and OSS libs typically have the same tasks. We've created a `common-gulp` module at the root of this project that you can include to automatically define these tasks. If you go this route, your gulpfile would look like this:

```javascript
// gulpfile.js
var bg = require( "biggulp/common-gulp" )( require( "gulp" ) );
/*
	Gives you the following tasks:
	├── restartProcesses
    ├── continuous-test
    ├─┬ coverage
    │ └── format
    ├── coverage-watch
    ├─┬ default
    │ ├── coverage
    │ └── coverage-watch
    ├─┬ format
    │ └── jshint
    ├── help
    ├── jshint
    ├── show-coverage
    ├─┬ test
    │ └── test-watch
    ├── test-and-exit
    ├── test-behavior
    ├── test-int
    └── test-watch
*/
```

>NOTE: Biggulp actually uses this approach for its gulpfile - biggulp-ception™.

## Custom Example
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
var gulp = require( "gulp" );
// uses default paths
var bg = require( "biggulp" )( gulp );

// a task to pass default tests to istanbul
// results in a coverage report at the end of
// test run
gulp.task( "coverage", function() {
	bg.withCoverage();
} );

// a watch task against default paths and
// run the coverage task on file changes
gulp.task( "coverage-watch", function() {
	bg.watch( [ "coverage" ] );
} );

// open a browser after the test run and exit
gulp.task( "show-coverage", function() {
	return bg.showCoverage();
} );

// just run the specs via mocha
gulp.task( "continuous-specs", function() {
	return bg.testAll();
} );

// sets up a watch on default paths and
// runs the `continuous-specs` task on file change
gulp.task( "specs-watch", function() {
	bg.watch( [ "continuous-specs" ] );
} );

// run specs and exit with a code to indicate pass/fail
gulp.task( "test-and-exit", function() {
	return bg.testAllOnce();
} );

gulp.task( "default", [ "coverage", "coverage-watch" ], function() {} );
gulp.task( "specs", [ "continuous-specs", "specs-watch" ], function() {} );
gulp.task( "build", [ "test-and-exit" ] );
 ```

## RoadMap / TODOs

* We are going to introduce the ability to set the output directory for istanbul reports, and thus the main page to load to display the report(s).
