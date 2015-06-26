## 0.1.x

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
