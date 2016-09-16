var processor = require('./tasks/processor');
var publisher = require('./tasks/publisher');
var S = require("string");

/**
 * @param {Grunt} grunt
 */
module.exports = function(grunt) {
  
  'use strict';
  
  // autoload everything that looks like Grunt tasks
	require('load-grunt-tasks')(grunt);
  
  // read config and apply local overrides (gitignored!)
	var config = require('./tasks/config').init(grunt).merge(
		'config.json',
		'config.local.json'
	);
  
  // Config ....................................................................
  
  grunt.config.init({
    
    // for grunt template.process()
    config: config,
    
    // tags to include in HEAD when building for local development 
		localtags: [
      '<meta name="viewport" content="width=device-width"/>',
			'<script src="//127.0.0.1:10111/dist/ts.min.js"></script>',
      '<script src="/dist/assets/dox.min.js"></script>',
      '<script src="/dist/assets/jquery-2.2.4.min.js"></script>',
      '<link rel="stylesheet" href="/dist/assets/dox.css"/>'
		],
    
    // tags to include in HEAD when publishing to GitHub pages (TODO!)
    publictags: [
      '<meta name="viewport" content="width=device-width"/>',
      '<script src="<%=config.runtime_hosting%>/ts-<%=config.runtime_version%>.min.js"></script>',
      '<script src="/dist/assets/dox.min.js"></script>',
      '<script src="/dist/assets/jquery-2.2.4.min.js"></script>',
      '<link rel="stylesheet" href="/dist/assets/dox.css"/>'
    ],
    
    // nuke previous build
		clean: {
			all: [
				'dist/**'
			]
		},
    
    connect: {
      server: {
        options: {
          keepalive: true,
          port: 10114,
          base: '../docs'
        }
      }
    },
    
    // build spiritual bundles
		guibundles: {
			dox: {
				options: {
					min: false
				},
				files: {
          'temp/dox-api.js' : ['src/js/dox-api@tradeshift.com/build.json'],
					'temp/dox-gui.js' : ['src/js/dox-gui@tradeshift.com/build.json']
				}
			}
		},
    
    // parse all EDBML+HTML files from SRC into docs folder.
		edbml: {
			target_local: getinlineconfig('localtags'),
      target_public: getinlineconfig('publictags'),
      outline: {
				options: {
					beautify: true
				},
				files: {
					'temp/dox-edbml.js' : ['src/edbml/*.edbml']
				}
      }
		},
    
		copy: {
      target_local: getindexconfig('localtags'),
      target_public: getindexconfig('publictags'),
      libs: {
        files: [
					{
						expand: true, 
						cwd: 'src/js/',
            dest: 'dist/assets/', 
						src: [
							'angular-1.3.6.min.js',
							'jquery-2.2.4.min.js',
              'lunr.min.js'
						]
					}
				]
      },
			pageassets: {
				files: [
					{
						expand: true, 
						cwd: 'src/xhtml/',
            dest: 'dist/',
						src: [
							'**',
							'!**/*.xhtml',
							'!**/*.less',
						]
					}
				]
			}
		},
    
    uglify: {
      options: {
        sourceMap: true,
        mangle: false
      },
      dox: {
        files: {
          'dist/assets/dox.min.js': [
            'temp/dox-api.js',
            'temp/dox-gui.js',
            'temp/dox-edbml.js'
          ]
        }
      }
    },
    
    less: {
      global: {
        files: {
          'dist/assets/dox.css': 'src/less/ts-docs.less'
        }
      },
      local: {
				options: {
					paths: 'src/less', // not working :/
				},
				files: [{
					expand: true,
					cwd: 'src/xhtml/',
					src: [ '**/*.less' ],
					dest: 'dist',
					ext: '.css'
				}]
			}
    },
    
    watch: {
      js_global: {
        files: 'src/js/**/*.js',
        tasks: ['guibundles', 'uglify'],
        options: {debounceDelay: 250}
      },
      js_local: {
        files: 'src/xhtml/**/*.js',
        tasks: ['copy:pageassets'],
        options: {debounceDelay: 250}
      },
      css: {
        files: 'src/less/**/*.less',
        tasks: ['less'],
        options: {debounceDelay: 250}
      },
      edbml: {
        files: 'src/edbml/**/*.edbml',
        tasks: ['edbml:outline', 'uglify'],
        options: {debounceDelay: 250}
      },
      xhtml: {
        files: ['src/xhtml/**/*', 'tasks/processor.js'],
        tasks: ['copy:target_local', 'edbml:target_local', 'less:local'],
        options: {debounceDelay: 250}
      },
      json: {
        files: 'menu.json',
        tasks: ['copy:target_local'],
        options: {debounceDelay: 250}
      }
    },
    
    concurrent: {
      localdev: {
				tasks: ['connect', 'watch'],
				options: {
					logConcurrentOutput: true
				}
			}
    }
    
  });
  
  /**
   * Get "inline" EDBML config (used when parsing XHTML source files).
   * @param {string} tagset
   * @returns {object}
   */
  function getinlineconfig(tagset) {
    return {
      expand: true,
      dest: 'dist',
      cwd: 'src/xhtml',
      src: [
        '**/*.xhtml',
        '!assets/**'
      ],
      options: {
        inline: true,
        beautify: true,
        attribute: 'data-ts',
        process: function(html, source, target) {
          var tags = grunt.template.process('<%=' + tagset + '%>');
          return processor.process(html, tags, source);
        }
      }
    };
  }
  
  /**
   * Get config for copying and parsing the index file (the chrome).
   * @param {string} tagset
   * @returns {object}
   */
  function getindexconfig(tagset) {
    return {
      expand: false,
      src: 'src/xhtml/index.xhtml',
      dest: './index.html',
      options: {
        process: function (content, srcpath) {
          var tags = grunt.template.process('<%=' + tagset +'%>');
          var menu = grunt.file.readJSON('menu.json');
          var json = JSON.stringify(menu, null, null);
          tags = tags.replace(/,/g, '\n    ');
          return publisher.publish(
            content.
              replace('${includes}', tags).
              replace('${menujson}', json)
          );
        }
      }
    };
  }
  
  
  // Tasks .....................................................................

  // local development (don't commit this to Git!)
  grunt.task.registerTask('default', xxx('target_local').concat(['concurrent']));
  
  // important: Run this before committing to Git!
  grunt.task.registerTask('dist', xxx('target_public'));

  /**
   * Build task list.
   * @param {string } tags
   * @returns {Array<string>}
   */
  grunt.task.registerTask('lunr', 'generate lunr index', function(){
    var prefix = 'dist/';
    grunt.log.writeln("Build pages index");
    var indexPages = function() {
        var pagesIndex = [];
        grunt.file.recurse(prefix, function(abspath, rootdir, subdir, filename) {
            grunt.verbose.writeln("Parse file:",abspath);
            pagesIndex.push(processFile(abspath, filename));
        });

        return pagesIndex;
    };

    var processFile = function(abspath, filename) {
        var pageIndex;

        if (S(filename).endsWith(".html")) {
            pageIndex = processHTMLFile(abspath, filename);
        }
        return pageIndex;
    };

    var processHTMLFile = function(abspath, filename) {
      var content = grunt.file.read(abspath);
      if(S(content).between('<meta','>').contains('noindex')) {
        return;
      }
      var title = S(content).between('<title>','</title>').s;
      var href = S(abspath)
          .chompLeft(prefix).s;
      return {
          title: title,
          href: href,
          content: S(content).trim().stripTags().stripPunctuation().s
      };
    };

    grunt.file.write("dist/lunr.json", JSON.stringify(indexPages()));
    grunt.log.ok("Index built");
  });

  /**
   * Build task list.
   * @param {string } tags
   * @returns {Array<string>}
   */
  function xxx(tags) {
    return [
      'clean',
      'guibundles',
      'edbml:outline',
      'edbml:' + tags,
      'copy:' + tags,
      'copy:libs',
      'copy:pageassets',
      'uglify',
      'less',
      'lunr'
    ];
  }
  
};
