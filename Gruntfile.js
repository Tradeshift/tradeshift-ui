/* global process */
const path = require('path');

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
	['tsjs', 'tsless', 'check_cdn'].forEach(function(task) {
		require('./tasks/' + task).init(grunt);
	});

	// read config and apply local overrides (gitignored!)
	const config = require('./tasks/config').init(grunt).merge('config.json', 'config.local.json');

	// Tasks .....................................................................

	// setup for local development (no docs)
	grunt.registerTask('default', [].concat(build('dev'), sizeReport('dev'), ['concurrent:nodocs']));

	// setup for local development (with docs)
	grunt.registerTask('dev', [].concat(build('dev'), sizeReport('dev'), ['concurrent:docs']));

	// build for CDN
	grunt.registerTask(
		'dist',
		[].concat(['exec:eslint'], build('cdn'), sizeReport('cdn'), ['exec:docs_dist'])
	);

	// build for jasmine tests
	grunt.registerTask('jasmine', [].concat(build('jasmine'), ['concat:jasmine', 'copy:jasmine']));

	// never called directly, release-it will do that for us
	grunt.registerTask('release-deploy', ['concurrent:check_cdn_while_dist', 'exec:s3_upload']);

	// Config ....................................................................

	grunt.initConfig({
		config: config,
		pkg: grunt.file.readJSON('package.json'),

		// nuke previous build
		clean: {
			dev: ['temp/**', 'dist/**', 'public/**'],
			jasmine: ['temp/**', 'dist/**', 'public/**'],
			cdn: ['temp/**', 'dist/cdn/**', 'public/**']
		},

		copy: {
			// setup ts-runtime.less for the docs site
			docs_dev: {
				src: 'dist/ts-runtime.less',
				dest: 'docs/src/less/ts-runtime.less'
			},
			// setup ts-runtime.less for the docs site
			docs_cdn: {
				src: 'dist/ts-runtime.less',
				dest: 'dist/cdn/ts-runtime-<%= pkg.version %>.less'
			},
			// setup 'ts.js' for jasmine tests
			jasmine: {
				flatten: true,
				expand: true,
				src: ['dist/ts.js', 'dist/ts.css', 'dist/ts-lang-en.js'],
				dest: 'spec/jasmine/'
			},

			// setup language files for local development
			lang_dev: {
				flatten: true,
				expand: true,
				src: 'src/runtime/js/ts.ui/lang/*',
				dest: 'dist/'
			},

			// setup language files for CDN
			lang_cdn: {
				flatten: true,
				expand: true,
				src: 'src/runtime/js/ts.ui/lang/*',
				dest: 'dist/cdn/',
				rename: function(dest, src) {
					const ext = path.extname(src);
					const filename = path.basename(src, ext) + '-<%= pkg.version %>' + ext;
					return dest + '/' + grunt.template.process(filename);
				}
			},

			css_cdn: {
				files: [
					{
						src: 'dist/ts.css',
						dest: 'dist/cdn/ts-<%= pkg.version %>.css'
					},
					{
						src: 'dist/ts.min.css',
						dest: 'dist/cdn/ts-<%= pkg.version %>.min.css'
					}
				]
			}
		},

		tsjs: {
			// setup 'ts.js'
			dev: {
				options: {
					'${runtimecss}': '//127.0.0.1:10111/dist/ts.min.css',
					'${langbundle}': '//127.0.0.1:10111/dist/ts-lang-<LANG>.js'
				},
				files: {
					'temp/ts.js': 'src/runtime/ts.js'
				}
			},
			// setup 'ts.js' for jasmine tests
			jasmine: {
				options: {
					'${runtimecss}': 'ts.css',
					'${langbundle}': 'ts-lang-<LANG>.js'
				},
				files: {
					'temp/ts.js': 'src/runtime/ts.js'
				}
			},

			// setup 'ts.js' for CDN
			cdn: {
				options: {
					'${runtimecss}': '<%= config.cdn_live %>' +
						config.cdn_folder +
						'/ts-<%= pkg.version %>.min.css',
					'${langbundle}': '<%= config.cdn_live %>' +
						config.cdn_folder +
						'/ts-lang-<LANG>-<%= pkg.version %>.js'
				},
				files: {
					'temp/ts.js': 'src/runtime/ts.js'
				}
			}
		},

		tsless: {
			// concatenate the LESS (so that devs may copy-paste it from the web)
			cdn: {
				src: 'src/runtime/less/include.less',
				dest: 'dist/cdn/ts-runtime-<%= pkg.version %>.less'
			},
			// concatenate the LESS (so a local dev can see what's going in the file)
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
			fastclick: {
				// stuff that isn't necessarily "use strict"
				options: {
					separator: '\n\n',
					banner: '(function(window) {\n\n',
					footer: '\n\n}(self));'
				},
				dest: 'temp/fastclick.js',
				src: 'src/runtime/js/ts.ui/core/core-gui@tradeshift.com/dependencies/fastclick.js'
			},
			// moment.js
			moment: {
				options: {
					separator: '\n\n',
					banner: '(function() {\n\n',
					footer: '\n\n}).call(ts.ui);'
				},
				dest: 'temp/moment.js',
				src: 'src/third-party/moment.js'
			},
			// spin.js
			spin: {
				options: {
					separator: '\n\n',
					banner: '(function() {\n\n',
					footer: '\n\n}).call(ts.ui);'
				},
				dest: 'temp/spin.js',
				src: 'src/third-party/spin.js'
			},
			// all the ts js files
			dev: {
				options: getbuildoptions(),
				files: {
					'dist/ts.js': getcombobuilds()
				}
			},
			// all the ts js files
			cdn: {
				options: getbuildoptions(),
				files: {
					'dist/cdn/ts-<%= pkg.version %>.js': getcombobuilds()
				}
			},
			// all the ts js spec files
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
				mangle: false,
				compress: {
					sequences: true,
					properties: true,
					dead_code: true,
					drop_debugger: true,
					unsafe: false,
					unsafe_comps: false,
					unsafe_math: false,
					unsafe_proto: false,
					conditionals: true,
					comparisons: true,
					evaluate: true,
					booleans: true,
					loops: true,
					unused: true,
					toplevel: null,
					top_retain: false,
					hoist_funs: true,
					hoist_vars: false,
					if_return: true,
					join_vars: true,
					cascade: true,
					collapse_vars: true,
					reduce_vars: true,
					warnings: false,
					negate_iife: true,
					pure_getters: false,
					pure_funcs: null,
					drop_console: false,
					expression: false,
					keep_fargs: false,
					keep_fnames: false,
					passes: 1,
					keep_infinity: false
				},
				beautify: false,
				sourceMap: true,
				ASCIIOnly: true,
				preserveComments: false
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

		postcss: {
			compile_less_to_css: {
				options: {
					// parse less
					parser: require('postcss-less-engine').parser,
					processors: [
						// understand less
						require('postcss-less-engine')({
							relativeUrls: true,
							cleancss: false
						})
					]
				},
				files: { 'dist/ts.css': 'src/runtime/less/build.less' }
			},

			options: {
				processors: [
					// add .ts-device-mouse to all rules with :hover
					require('./tasks/touchfriendly')(),
					// add prefixes
					require('autoprefixer')(),
					// minify
					require('postcss-clean')({
						mergeIntoShorthands: false,
						sourceMap: true
					})
				]
			},
			generate_minified_css: {
				files: {
					'dist/ts.min.css': 'dist/ts.css'
				}
			}
		},

		// check some filesizes
		size_report: {
			// gzipped js vs normal
			cdn_gzip_vs_normal: {
				files: {
					list: ['dist/cdn/ts-*.min.js', 'public/ts-*.min.js']
				}
			},
			// minified js vs normal (gzipped)
			cdn_js_minified_vs_normal: {
				files: {
					list: ['public/ts-<%= pkg.version %>.js', 'public/ts-<%= pkg.version %>.min.js']
				}
			},
			// minified css vs normal (gzipped)
			cdn_css_minified_vs_normal: {
				files: {
					list: ['public/ts-<%= pkg.version %>.css', 'public/ts-<%= pkg.version %>.min.css']
				}
			},
			// data loaded in the browser
			cdn_loaded: {
				files: {
					list: [
						'public/ts-<%= pkg.version %>.min.js',
						'public/ts-<%= pkg.version %>.min.css',
						'public/ts-lang-en-<%= pkg.version %>.js'
					]
				}
			},
			// minified js vs normal
			dev_js_minified_vs_normal: {
				files: {
					list: ['dist/ts.js', 'dist/ts.min.js']
				}
			},
			// minified css vs normal
			dev_css_minified_vs_normal: {
				files: {
					list: ['dist/ts.css', 'dist/ts.min.css']
				}
			},
			// data loaded in the browser
			dev_loaded: {
				files: {
					list: ['dist/ts.min.js', 'dist/ts.min.css', 'dist/ts-lang-en.js']
				}
			}
		},

		// gzip everything
		compress: {
			main: {
				options: {
					mode: 'gzip'
				},
				expand: true,
				cwd: 'dist/cdn/',
				src: ['**/*.map', '**/*.js', '**/*.css', '**/*.less'],
				dest: 'public/'
			}
		},

		// repeat these steps when needed
		watch: {
			js: {
				tasks: concatAndUglifyJs('dev'),
				files: ['src/**/*.js', 'src/**/*.json']
			},
			less: {
				tasks: [].concat(compileAndMinifyLess('dev'), ['tsless:dev']),
				files: ['src/runtime/less/**/*.less']
			},
			edbml: {
				tasks: [].concat('edbml', concatAndUglifyJs('dev')),
				files: ['src/runtime/edbml/**/*.edbml'],
				options: {
					spawn: false,
					debounceDelay: 250,
					interval: 100
				}
			}
		},

		// local dev server
		devserver: {
			// kill -9 $(lsof -t -i :10111)
			server: {},
			options: {
				base: '.',
				port: 10111
			}
		},

		// version already uploaded?
		check_cdn: {
			cdn: {
				urls: [
					'<%= config.cdn_base %>' + config.cdn_folder + '/ts-<%= pkg.version %>.js',
					'<%= config.cdn_base %>' + config.cdn_folder + '/ts-<%= pkg.version %>.min.js',
					'<%= config.cdn_base %>' + config.cdn_folder + '/ts-<%= pkg.version %>.min.js.map'
				]
			}
		},

		// execute command line stuff
		exec: {
			s3_upload: {
				command: 'npm run deploy-s3',
				stdout: 'inherit'
			},
			eslint: {
				command: 'npm run eslint',
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

		asciify: {
			banner: {
				text: 'Tradeshift UI',
				options: {
					font: 'graffiti',
					log: true
				}
			}
		},

		// serve, watch, generate concurrently
		concurrent: {
			docs: ['devserver', 'watch', 'exec:docs_grunt'],
			nodocs: ['devserver', 'watch', 'asciify:banner'],
			// Build for CDN
			cdn_generate_js: {
				tasks: generateJsConcurrent('cdn')
			},
			cdn_generate_css_and_copy_lang_and_concat_js: {
				tasks: generateCssAndCopyLangAndConcatJsConcurrent('cdn')
			},
			// Build for dev
			dev_generate_js: {
				tasks: generateJsConcurrent('dev')
			},
			dev_generate_css_and_copy_lang_and_concat_js: {
				tasks: generateCssAndCopyLangAndConcatJsConcurrent('dev')
			},
			// Build for Jasmine
			jasmine_generate_js: {
				tasks: generateJsConcurrent('jasmine')
			},
			jasmine_generate_css_and_copy_lang_and_concat_js: {
				tasks: generateCssAndCopyLangAndConcatJsConcurrent('jasmine')
			},
			// Check for existing files on CDN while building dist
			check_cdn_while_dist: {
				tasks: ['check_cdn:cdn', 'dist']
			},
			options: {
				logConcurrentOutput: true,
				limit: 16
			}
		}
	});

	// Utility functions .........................................................

	function returnDevForJasmine(target) {
		if (target === 'jasmine') {
			return 'dev';
		}
		return target;
	}

	function generateJsConcurrent(target = 'cdn') {
		return [
			'edbml', // edbml -> js
			`tsjs:${target}`,
			[
				// generate ts.js
				`tsless:${returnDevForJasmine(target)}`, // generate ts.less
				`copy:docs_${returnDevForJasmine(target)}` // copy ts-runtime.less over to the docs
			],

			'concat:fastclick', // generate fastclick.js
			'concat:moment', // generate moment.js
			'concat:spin', // generate spin.js
			'guibundles' // generate ts-runtime-{api,gui}.js
		];
	}

	function concatAndUglifyJs(target = 'cdn') {
		return [
			`concat:${returnDevForJasmine(target)}`, // concat all files generated above
			`uglify:${returnDevForJasmine(target)}` // uglify
		];
	}

	function compileAndMinifyLess(target = 'cdn') {
		let out = [
			'postcss:compile_less_to_css', // less -> css
			'postcss:generate_minified_css' // css -> min.css
		];
		if (target === 'cdn') {
			out.push('copy:css_cdn');
		}
		return out;
	}

	function generateCssAndCopyLangAndConcatJsConcurrent(target = 'cdn') {
		return [
			concatAndUglifyJs(target),
			compileAndMinifyLess(target),
			`copy:lang_${returnDevForJasmine(target)}` // copy lang files
		];
	}

	function build(target = 'cdn') {
		let out = [
			`clean:${target}`, // remove files
			`concurrent:${target}_generate_js`,
			`concurrent:${target}_generate_css_and_copy_lang_and_concat_js`
		];
		if (target === 'cdn') {
			out.push('compress'); // gzip everything
		}
		return out;
	}

	function sizeReport(target = 'cdn') {
		let out = [];
		if (target === 'cdn') {
			out.push('size_report:cdn_gzip_vs_normal');
		}
		out = out.concat([
			`size_report:${target}_js_minified_vs_normal`,
			`size_report:${target}_css_minified_vs_normal`,
			`size_report:${target}_loaded`
		]);
		return out;
	}

	/**
	 * Get task config for building a Spiritual bundle (still known as 'module').
	 * @param {string} target Where to write the computed bundle
	 * @param {Array<string>} sources (probably a JSON file with more sources)
	 * @returns {object}
	 */
	function bundle(target, sources) {
		const bundleConfig = {
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
		]
			.map(validated)
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
		return ['temp/ts.js'].concat(getapibuilds()).concat(getguibuilds());
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
			'temp/fastclick.js',
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
					const version = grunt.template.process('<%= pkg.version %>');
					return src.replace('$$VERSION$$', version);
				}
				return src;
			}
		};
	}

	/**
	 * Lookup scripts as JSON array.
	 * @param {string} file path
	 * @returns {Array<string>}
	 */
	function getbuild(file) {
		const folder = path.dirname(file);
		return grunt.file.readJSON(file).map(function(src) {
			return validated(path.normalize(folder + '/' + src));
		});
	}

	/**
	 * File exists?
	 * @param {string} src
	 * @returns {string}
	 */
	function validated(src) {
		if (!grunt.file.exists(src)) {
			grunt.log.error('Human error: ' + src + ' does not exist.');
		}
		return src;
	}
};
