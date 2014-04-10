/*
 * grunt-compressHtml
 * https://github.com/jason/compressHtml
 *
 * Copyright (c) 2014 littleBeat
 * Licensed under the MIT license.
 */

'use strict';

var CleanCSS = require('clean-css');
var REG_CSS = /\<\s*?style.*?\s*?\>([\s\S]*?)\<\s*?\/\s*?style\s*?\>/i;
function minifyCSS(source, options) {
  if(!REG_CSS.test(source))
    return;
  var cssSection = source.match(REG_CSS)[1];
  try {
    var minCssSection = CleanCSS(options).minify(cssSection);
    source = source.replace(cssSection, minCssSection);
  } catch (e) {
    grunt.log.error(e);
    grunt.fail.warn('css minification failed.');
  }
  return source;
};


var minify = require('html-minifier');
var REG_html = /\<script[^\>]*?text\/template[^\>]*?"\>([\s\S]*?)\<\/script\>|\<\s*?body\s*?\>([\s\S]*?)\<\/\s*?body\s*?\>/i;
// Iterate over all specified file groups.
function minifyHtml(source, options) {
  if(!REG_html.test(source))
    return source;
  while(var htmlSection = REG_html.exec(source)){
    try {
      var minHtmlSection = minify.minify(htmlSection, options);
      source = source.replace(htmlSection, minHtmlSection);
    } catch (e) {
      grunt.log.error(e);
      grunt.fail.warn('htmlmin minification failed.');
    }
  }
  return source;
};

var uglify = require('uglify');
var REG_JS = /\<\s*?script\s*?\>([\s\S]*?)\<\/\s*?script\s*?\>/i;
function minifyJS(source, options) {
  if(!REG_JS.test(source))
    return source;
  while(var JSSection = REG_JS.exec(source)){
    try {
      var minJSSection = uglify.minify(JSSection, {fromString: true});
      source =  source.replace(JSSection, minJSSection);
    } catch (e) {
      grunt.log.error(e);
      grunt.fail.warn('htmltemplatemin minification failed.');
    }
  }
  return source;
}
    




module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks
    
    // Iterate over all specified file groups.
  grunt.registerMultiTask('compressPage', 'compress page including css js html', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      punctuation: '.',
      separator: ', '
    });

    // Iterate over all specified file groups.
    this.files.forEach(function(f) {
      // Concat specified files.
      var src = f.src.filter(function(filepath) {
        // Warn on and remove invalid source files (if nonull was set).
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        } else {
          htmlCompress();
          return true;
        }
      }).map(function(filepath) {
        // Read file source.
        return grunt.file.read(filepath);
      }).join(grunt.util.normalizelf(options.separator));

      // Handle options.
      src += options.punctuation;

      // Write the destination file.
      grunt.file.write(f.dest, src);

      // Print a success message.
      grunt.log.writeln('File "' + f.dest + '" created.');
    });
  });

};
