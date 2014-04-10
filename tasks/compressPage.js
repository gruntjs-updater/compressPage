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
function minifyCSS(source, grunt) {
  if(!REG_CSS.test(source))
    return;
  var cssSection = source.match(REG_CSS)[1];
  try {
    var minCssSection = CleanCSS().minify(cssSection);
    source = source.replace(cssSection, minCssSection);
  } catch (e) {
    grunt.log.error(e);
    grunt.fail.warn('css minification failed.');
  }
  return source;
};


var minify = require('html-minifier');
var REG_html = /\<script[^\>]*?text\/template[^\>]*?"\>([\s\S]*?)\<\/script\>/g;
// Iterate over all specified file groups.
function minifyHtml(source, grunt) {
  var options = {
    removeComments: true,
    collapseWhitespace: true   
  }
  try {
    var source = minify.minify(source, options);
  } catch(e){}
  
  var result = source;
  var htmlSection = "";

  while(htmlSection = REG_html.exec(source)){
    if(/^\s*$/.test(htmlSection[1]))
      continue;
    try {
      htmlSection = htmlSection[1];
      var minHtmlSection = minify.minify(htmlSection, options);
      result = result.replace(htmlSection, minHtmlSection);
    } catch (e) {
      grunt.log.error(e);
      grunt.fail.warn('htmlmin minification failed.');
    }
  }
  return result;
};

var uglify = require('uglify-js');
var REG_JS = /\<\s*?script[^\>]*?\>([\s\S]*?)\<\/\s*?script\s*?\>/g;
function minifyJS(source, grunt) {
  var result = source;
  var JSSection = "";
  while(JSSection = REG_JS.exec(source)){
    if( /^\s*$/.test(JSSection[1]) || REG_html.test(JSSection[0]) )
      continue;
    try {
      JSSection = JSSection[1];
      var minJSSection = uglify.minify(JSSection, {fromString: true});
      result = result.replace(JSSection, minJSSection.code);
    } catch (e) {
      grunt.log.error(e);
      grunt.fail.warn('js minification failed.');
    }
  }
  return result;
}
    




module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks
    
    // Iterate over all specified file groups.
  grunt.registerMultiTask('compressPage', 'compress page including css js html', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options();

    // Iterate over all specified file groups.
    this.files.forEach(function(f) {
      // Concat specified files.
      var src = f.src.filter(function(filepath) {
        // Warn on and remove invalid source files (if nonull was set).
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        } else {
          return true;
        }
      }).map(function(filepath) {
        var source = grunt.file.read(filepath);
        source = minifyCSS(source, grunt);
        source = minifyHtml(source, grunt);
        source = minifyJS(source, grunt);
        return source;
      })
      grunt.file.write(f.dest, src);
      // Print a success message.
      grunt.log.writeln('File "' + f.dest + '" created.');
    });
  });

};
