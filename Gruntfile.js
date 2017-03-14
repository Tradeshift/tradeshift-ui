/* global process */

/**
 * TODO (jmo@): node --max-old-space-size=4096 /usr/local/bin/grunt ci
 * @param {Grunt} grunt
 */
module.exports = function(grunt) {
	'use strict';

	// load grunt tasks
	require('load-grunt-tasks')(grunt);

	// default file encoding
	grunt.file.defaultEncoding = 'utf8';

	// import custom tasks (to keep this file somewhat readable)
	[
		'tsjs',
		'tsless',
		'touchfriendly',
		'check_cdn'
	].forEach(function(task) {
		require('./tasks/' + task).init(grunt);
	});

	// read config and apply local overrides (gitignored!)
	var config = require('./tasks/config').init(grunt).merge(
		'config.json',
		'config.local.json'
	);

	// Config ....................................................................
	grunt.initConfig({

		config: config,
		pkg: grunt.file.readJSON('package.json'),

		// nuke previous build
		clean: {
			all: [
				'temp/**',
				'dist/**',
				'public/**'
			],
			cdn: [
				'temp/**',
				'dist/cdn/**',
				'public/**'
			]
		},

		// setup 'ts.js' for local development
		copy: {
			dev: {
				src: 'src/runtime/js/ts-dev.js',
				dest: 'dist/ts.js'
			},
			jasmine: {
				flatten: true,
				expand: true,
				src: ['dist/ts.js', 'dist/ts.css', 'dist/ts-lang-en.js'],
				dest: 'spec/jasmine/'
			},
			lang_dev: {
				flatten: true,
				expand: true,
				src: 'src/runtime/js/ts.ui/lang/*',
				dest: 'dist/'
			},
			lang_cdn: {
				flatten: true,
				expand: true,
				src: 'src/runtime/js/ts.ui/lang/*',
				dest: 'dist/cdn/',
				rename: function(dest, src) {
					var path = require('path');
					var ext = path.extname(src);
					var filename = path.basename(src, ext) + '-<%= pkg.version %>' + ext;
					return dest + '/' + grunt.template.process(filename);
				}
			},
			fix_less_gzip: {
				flatten: true,
				expand: true,
				src: 'dist/cdn/*.less',
				dest: 'public/'
			}
		},

		// setup 'ts.js'
		tsjs: {
			dev: {
				options: {
					'${runtimecss}': '//127.0.0.1:10111/dist/ts.min.css',
					'${langbundle}': '//127.0.0.1:10111/dist/ts-lang-<LANG>.js'
				},
				files: {
					'temp/ts.js': 'src/runtime/ts.js'
				}
			},
			jasmine: {
				options: {
					'${runtimecss}': 'ts.css',
					'${langbundle}': 'ts-lang-<LANG>.js'
				},
				files: {
					'temp/ts.js': 'src/runtime/ts.js'
				}
			},
			prod: {
				options: {
					'${runtimecss}': '<%= config.cdn_live %>' + config.folder_prod + '/ts-<%= pkg.version %>.min.css',
					'${langbundle}': '<%= config.cdn_live %>' + config.folder_prod + '/ts-lang-<LANG>-<%= pkg.version %>.js'
				},
				files: {
					'temp/ts.js': 'src/runtime/ts.js'
				}
			}
		},

		// concatante the LESS (so that devs may copy-paste it from the web)
		tsless: {
			cdn: {
				src: 'src/runtime/less/include.less',
				dest: 'dist/cdn/ts-runtime-<%= pkg.version %>.less'
			},
			dev: {
				src: 'src/runtime/less/include.less',
				dest: 'dist/ts-runtime.less'
			}
		},

		// parse EDBML to JS
		edbml: {
			outline: {
				options: {},
				files: {
					'temp/edbml-compiled.js': ['src/runtime/edbml/**/*.edbml']
				}
			}
		},

		// concatenate those files
		concat: {
			loose: { // stuff that isn't necessarily "use strict"
				options: {
					separator: '\n\n',
					banner: '(function(window) {\n\n',
					footer: '\n\n}(self));'
				},
				dest: 'temp/js-loose-compiled.js',
				src: ['fastclick.js'].map(function(src) {
					return 'src/runtime/js/ts.ui/core/core-gui@tradeshift.com/dependencies/' + src;
				})
			},
			moment: {
				options: {
					separator: '\n\n',
					banner: '(function() {\n\n',
					footer: '\n\n}).call(ts.ui);'
				},
				dest: 'temp/moment.js',
				src: 'src/third-party/moment.js'
			},
			spin: {
				options: {
					separator: '\n\n',
					banner: '(function() {\n\n',
					footer: '\n\n}).call(ts.ui);'
				},
				dest: 'temp/spin.js',
				src: 'src/third-party/spin.js'
			},
			dev: {
				options: getbuildoptions(),
				files: {
					'dist/ts.js': getcombobuilds()
				}
			},
			cdn: {
				options: getbuildoptions(),
				files: {
					'dist/cdn/ts-<%= pkg.version %>.js': getcombobuilds()
				}
			},
			jasmine: {
				src: ['spec/spiritual/**/*.spec.js', 'spec/runtime/**/*.spec.js'],
				dest: 'spec/jasmine/specs.js'
			}
		},

		// build spiritual bundles
		guibundles: {

			// spiritual (core) modules
			spiritualgui: bundle('temp/module-gui.js', [
				'src/spiritual/spiritual-gui/gui@wunderbyte.com/build.json'
			]),
			spiritualgui_spirits: bundle('temp/module-gui-spirits.js', [
				'src/spiritual/spiritual-gui/gui-spirits@wunderbyte.com/build.json'
			]),
			spiritualedb: bundle('temp/module-edb.js', [
				'src/spiritual/spiritual-edb/edb@wunderbyte.com/build.json',
				'src/spiritual/spiritual-edb/edb-sync@wunderbyte.com/build.json'
			]),
			spiritualedbml: bundle('temp/module-edbml.js', [
				'src/spiritual/spiritual-edbml/edbml@wunderbyte.com/build.json'
			]),
			spiritualmix: bundle('temp/modules-mix.js', [
				'src/spiritual/spiritual-mix/gui-layout@wunderbyte.com/build.json',
				'src/spiritual/spiritual-mix/gui-keys@wunderbyte.com/build.json'
			]),

			// runtime (tradeshift widgets) modules
			runtimeapi: bundle('temp/ts-runtime-api.js', getapisources()),
			runtimegui: bundle('temp/ts-runtime-gui.js', getguisources())
		},

		// crunch to minified JS
		uglify: {
			options: {
				beautify: false,
				mangle: false,
				sourceMap: true
			},
			dev: {
				files: {
					'dist/ts.min.js': 'dist/ts.js'
				}
			},
			cdn: {
				files: {
					'dist/cdn/ts-<%= pkg.version %>.min.js': 'dist/cdn/ts-<%= pkg.version %>.js'
				}
			}
		},

		// compile LESS to CSS
		less: {
			before: {
				options: {
					relativeUrls: true,
					cleancss: false
				},
				files: {
					'temp/css-compiled.css': 'src/runtime/less/build.less'
				}
			}
		},

		// CSS post-parsing will optimize for mobile
		// (only do :hover on devices with a mouse!)
		touchfriendly: {
			dev: {
				files: {
					'dist/ts.css': 'temp/css-compiled.css'
				}
			},
			cdn: {
				files: {
					'dist/cdn/ts-<%= pkg.version %>.css': 'temp/css-compiled.css'
				}
			}
		},

		// crunch to minified CSS
		cssmin: {
			options: {
				shorthandCompacting: false,
				roundingPrecision: -1,
				sourceMap: true
			},
			dev: {
				files: {
					'dist/ts.min.css': 'dist/ts.css'
				}
			},
			cdn: {
				files: {
					'dist/cdn/ts-<%= pkg.version %>.min.css': 'dist/cdn/ts-<%= pkg.version %>.css'
				}
			}
		},

		compress: {
			main: {
				options: {
					mode: 'gzip'
				},
				expand: true,
				cwd: 'dist/cdn/',
				src: [
					'**/*.map',
					'**/*.js',
					'**/*.css'
				],
				dest: 'public/'
			}
		},

		// repeat these steps when needed
		watch: {
			js: {
				tasks: ['concat:loose', 'guibundles', 'concat:dev', 'uglify:dev'],
				files: ['src/**/*.js', 'src/**/*.json']
			},
			less: {
				tasks: ['less:before', 'touchfriendly', 'cssmin:dev', 'tsless:dev'],
				files: ['src/runtime/less/**/*.less']
			},
			edbml: {
				tasks: [
					'edbml',
					'concat:loose',
					'guibundles',
					'concat:dev',
					'uglify:dev'
				],
				files: ['src/runtime/edbml/**/*.edbml'],
				options: { interval: 5000 }
			}
		},

		// serve and watch
		concurrent: {
			docs: ['devserver', 'watch', 'exec:docs_grunt'],
			nodocs: ['devserver', 'watch', 'asciify:banner'],
			options: {
				logConcurrentOutput: true
			}
		},

		// local dev server
		devserver: { // kill -9 $(lsof -t -i :10111)
			server: {},
			options: {
				base: '.',
				port: 10111
			}
		},

		// version already uploaded?
		check_cdn: {
			prod: {
				urls: [
					'<%= config.cdn_base %>' + config.folder_prod + '/ts-<%= pkg.version %>.js',
					'<%= config.cdn_base %>' + config.folder_prod + '/ts-<%= pkg.version %>.min.js',
					'<%= config.cdn_base %>' + config.folder_prod + '/ts-<%= pkg.version %>.min.js.map'
				]
			}
		},

		// hooked
		gitadd: {},

		// hooked
		gitcommit: {},

		// hooked again
		gitpush: {},

		// execute command line stuff
		exec: {
			s3_upload: {
				command: 'npm run deploy-s3',
				stdout: 'inherit'
			},
			eslint: {
				command: 'npm run lint',
				stdout: 'inherit'
			},
			docs_dist: {
				command: 'cd docs && grunt dist',
				stdout: 'inherit'
			},
			docs_grunt: {
				command: 'cd docs && grunt',
				stdout: 'inherit'
			}
		},

		release: {
			options: {
				bump: true, // enable bumping the version
				silent: false, // display the output of git and other grunt tasks
				commit: true, // commit changes to git
				commitMessage: '[bump] v<%= version %>',
				push: true, // push your commits to git
				tag: true, // add a new tag based on the release
				tagName: 'v<%= version %>',
				tagMessage: 'v<%= version %>',
				pushTags: true, // push the new tag to git
				npm: false, // this isn't an npm module
				afterBump: [
					'release-deploy' // deploy to S3 after everything is done
				],
				github: {
					repo: 'Tradeshift/tradeshift-ui',
					/**
					 * don't forget to create a GitHub Access Token here:
					 * https://help.github.com/articles/creating-an-access-token-for-command-line-use
					 * And set it as an ENV VAR
					 */
					accessTokenVar: 'GH_ACCESS_TOK'
				}
			}
		},

		asciify: {
			banner: {
				text: 'Tradeshift UI',
				options: {
					font: 'graffiti',
					log: true
				}
			}
		}
	});

	// Utility functions .........................................................

	/**
	 * Get task config for building a Spiritual bundle (still known as 'module').
	 * @param {string} target Where to write the computed bundle
	 * @param {Array<string>} sources (probably a JSON file with more sources)
	 * @returns {object}
	 */
	function bundle(target, sources) {
		var bundleConfig = {
			options: {
				min: false
			},
			files: {}
		};
		bundleConfig.files[target] = sources;
		return bundleConfig;
	}

	/**
	 * Get them API sources. For now we simply release the kitchen sink.
	 * @returns {Array<string>}
	 */
	function getapisources() {
		const build = src => getbuild('src/runtime/js/ts.ui/' + src);
		return [
			'src/runtime/js/ts-polyfilla.js',
			'src/runtime/js/ts-namespace.js',
			'src/runtime/js/ts.ui/ts.ui.js'
		].map(validated)
			.concat(getbuild('src/runtime/js/ts.lib/build.json'))
			.concat(build('core/core-api@tradeshift.com/build.json'))
			.concat(build('forms/forms-api@tradeshift.com/build.json'))
			.concat(build('objects/objects-api@tradeshift.com/build.json'))
			.concat(build('bars/bars-api@tradeshift.com/build.json'))
			.concat(build('tables/tables-api@tradeshift.com/build.json'));
	}

	/**
	 * Get them GUI sources. For now we simply release the kitchen sink.
	 * @returns {Array<string>}
	 */
	function getguisources() {
		const build = src => getbuild('src/runtime/js/ts.ui/' + src);
		return []
			.concat(build('core/core-gui@tradeshift.com/build.json'))
			.concat(build('forms/forms-gui@tradeshift.com/build.json'))
			.concat(build('objects/objects-gui@tradeshift.com/build.json'))
			.concat(build('bars/bars-gui@tradeshift.com/build.json'))
			.concat(build('tables/tables-gui@tradeshift.com/build.json'));
	}

	/**
	 * @returns {Array<string>}
	 */
	function getcombobuilds() {
		return ['temp/ts.js']
			.concat(getapibuilds())
			.concat(getguibuilds());
	}

	/**
	 * NOTE: If we split-up GUI and API stuff at some point in the
	 * future, note that "module-gui-spirits.js" should not be loaded
	 * in the API build. However, in the final (GUI) build, it is
	 * important that we load it before the 'ts-runtime-api.js' so
	 * that `ts.ui.ready` invokes correctly *after* spirits are in.
	 * @returns {Array<string>}
	 */
	function getapibuilds() {
		return [
			'temp/module-gui.js',
			'temp/module-gui-spirits.js',
			'temp/module-edb.js',
			'temp/ts-runtime-api.js',
			'temp/moment.js',
			'temp/spin.js'
		];
	}

	/**
	 *	@returns {Array<string>}
	 */
	function getguibuilds() {
		return [
			'temp/js-loose-compiled.js',
			'temp/modules-mix.js',
			'temp/module-edbml.js',
			'temp/ts-runtime-gui.js',
			'temp/edbml-compiled.js'
		];
	}

	/*
	 * @returns {object}
	 */
	function getbuildoptions() {
		return {
			process: function(src, path) {
				if (path === 'temp/ts-runtime-api.js') {
					var version = grunt.template.process('<%= pkg.version %>');
					return src.replace('$$VERSION$$', version);
				}
				return src;
			}
		};
	}

	/**
	 * Lookup scripts as JSON array.
	 * @param {string} path
	 * @returns {Array<string>}
	 */
	function getbuild(file) {
		var path = require('path');
		var folder = path.dirname(file);
		return grunt.file.readJSON(file).map(function(src) {
			return validated(path.normalize(folder + '/' + src));
		});
	}

	/**
	 * File exists?
	 * @param {string} src
	 * @returns {boolean}
	 */
	function validated(src) {
		if (!grunt.file.exists(src)) {
			grunt.log.error('Human error: ' + src + ' does not exist.');
		}
		return src;
	}

	/**
	 * Build for local development. This assumes that
	 * tradeshift-ui runs on localhost
	 * @returns {Array<string>}
	 */
	function buildlocal(target) {
		target = target || 'dev';
		return [
			'clean:all',
			'edbml',
			'tsjs:' + target,
			'concat:loose',
			'concat:moment',
			'concat:spin',
			'guibundles',
			'concat:dev',
			'uglify:dev',
			'less:before',
			'touchfriendly:dev',
			'cssmin:dev',
			'tsless:dev',
			'copy:lang_dev'
		];
	}

	/**
	 * Build for CDN upload.
	 * @param {string} target
	 * @returns {Array<string>}
	 */
	function buildcdn(target) {
		return [
			'clean:cdn',
			'edbml',
			'tsjs:' + target,
			'tsless:cdn',
			'concat:loose',
			'concat:moment',
			'concat:spin',
			'guibundles',
			'concat:cdn',
			'uglify:cdn',
			'less:before',
			'touchfriendly:cdn',
			'cssmin:cdn',
			'copy:lang_cdn',
			'compress',
			'copy:fix_less_gzip',
			'concat:jasmine',
			'copy:jasmine'
		];
	}

	// Tasks .....................................................................

	// setup for local develmopment (no docs)
	grunt.registerTask('default', buildlocal().concat(['concurrent:nodocs']));

	// setup for local develmopment (with docs)
	grunt.registerTask('dev', buildlocal().concat(['concurrent:docs']));

	// BUILD FOR PRODUCTION! RUN THIS BEFORE PULL REQUEST!
	// NOTE: Duplicate steps going on, should be optimized
	grunt.registerTask('dist', ['exec:eslint']
		.concat(buildlocal('jasmine'))
		.concat(['concat:jasmine', 'copy:jasmine'])
		.concat(buildcdn('prod'))
		.concat(['exec:docs_dist'])
	);

	// while developing, build the Jasmine test suite like this:
	grunt.registerTask('jasmine', buildlocal('jasmine').concat([
		'concat:jasmine',
		'copy:jasmine'
	]));

	// never called directly, grunt-release will do that for us
	grunt.registerTask('release-deploy', [
		'check_cdn:prod',
		'dist',
		'exec:s3_upload'
	]);

	// compile that CSS
	grunt.registerTask('css', 'Compiles CSS', [
		'less:before',
		'touchfriendly:dev',
		'cssmin:dev',
		'tsless:dev'
	]);

	// compile that JS
	grunt.registerTask('js', 'Compiles JS', [
		'edbml',
		'concat:loose',
		'concat:moment',
		'concat:spin',
		'guibundles',
		'concat:dev',
		'uglify:dev'
	]);
};
