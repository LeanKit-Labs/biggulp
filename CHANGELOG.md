## 0.4.x

### 0.4.0
 * Added option for setting istanbul options

### 0.3.0

 * Speed up linting and formatting by using a more specific sources glob
 * Update gulp-jscs dependency

### 0.2.1
 * Fix defect that causing watch tasks to crash the process if a test failed

### 0.2.0

 * Fix call to renamed processhost method
 * Allow test method to be called with default spec paths
 * Updated copyright notice in license
 * Added gulp-help for documenting tasks
 * Update test task to perform lint/format/coverage and test-and-exit to lint

### 0.1.2
Add a banner to help command. Banners are super cool.

### 0.1.1
 * Breaking refactor to accept options object in lieu of separate arguments
 * Internal methods now pull from default config unless overridden
 * Added common-gulp module to abstract common tasks.
 * Added self-referencing gulpfile

### 0.0.5
 * Excluding files under spec path from istanbul.

### 0.0.4
 * Switch to gulp-spawn-mocha from gulp-mocha & gulp-istanbul to fix issue where line numbers in source files were being incorrectly reported.

### 0.0.3

 * Update gulp-istanbul dependency to correct bug where multiple runs resulted in stack overflow
