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
	const config = require('./tasks/config')
		.init(grunt)
		.merge('config.json', 'config.local.json');

	/**
	 * Supported language codes. This will become populated
	 * as soon as we trawl the files in the `lang` folder.
	 * @type {Set<String>}
	 */
	const langcodes = new Set();

	// Tasks .....................................................................

	// setup for local development (no docs)
	grunt.registerTask('default', [].concat(build('dev'), ['concurrent:nodocs']));

	// setup for local development (with docs)
	grunt.registerTask('dev', [].concat(build('dev'), ['concurrent:docs']));

	// build for CDN
	grunt.registerTask(
		'dist',
		[].concat(['exec:eslint'], build('cdn'), sizeReport('cdn'), ['exec:docs_dist'])
	);

	// build for jasmine tests
	grunt.registerTask('jasmine', [].concat(build('jasmine'), ['concat:jasmine', 'copy:jasmine']));

	// never called directly, release-it will do that for us
	grunt.registerTask('release-deploy', ['concurrent:check_cdn_while_dist', 'exec:s3_upload']);
	grunt.registerTask('release-deploy-cn', [
		'concurrent:check_cdn_while_dist',
		'exec:ali_oss_upload'
	]);

	// Config ....................................................................

	grunt.initConfig({
		config: config,
		pkg: grunt.file.readJSON('package.json'),

		// nuke previous build
		clean: {
			dev: ['temp/**', 'dist/**', 'public/**'],
			jasmine: ['temp/**', 'dist/**', 'public/**'],
			cdn: ['temp/**', 'dist/cdn/**', 'dist/npm/**', 'public/**']
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
				src: ['dist/ts.js', 'dist/ts.css'],
				dest: 'spec/jasmine/'
			},
			css_cdn: {
				files: [
					{
						src: 'dist/ts.css',
						dest: 'dist/cdn/ts-<%= pkg.version %>.css'
					},
					{
						src: 'dist/ts.css',
						dest: 'dist/npm/ts.css'
					},
					{
						src: 'dist/ts.min.css',
						dest: 'dist/cdn/ts-<%= pkg.version %>.min.css'
					}
				]
			},
			npm: {
				files: [
					{
						src: 'LICENSE.md',
						dest: 'dist/npm/LICENSE.md'
					},
					{
						src: 'README.md',
						dest: 'dist/npm/README.md'
					}
				]
			}
		},

		tsless: {
			// concatenate the LESS (so that devs may copy-paste it from the web)
			cdn: {
				files: [
					{
						src: 'src/runtime/less/include.less',
						dest: 'dist/cdn/ts-runtime-<%= pkg.version %>.less'
					},
					{
						src: 'src/runtime/less/include.less',
						dest: 'dist/npm/ts-runtime.less' // keep this for legacy reasons...
					},
					{
						src: 'src/runtime/less/include.less', // ... but encourage this!
						dest: 'dist/npm/ts.less'
					}
				]
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
					'dist/cdn/ts-<%= pkg.version %>.js': getcombobuilds(),
					'dist/npm/ts.js': getcombobuilds()
				}
			},
			// all the ts js spec files
			jasmine: {
				src: ['spec/spiritual/**/*.spec.js', 'spec/runtime/**/*.spec.js'],
				dest: 'spec/jasmine/specs.js'
			},
			// translations into a mighty `switch` case
			locales: {
				src: 'src/runtime/js/ts.ui/lang/*.js',
				dest: 'temp/locales.js',
				options: {
					banner: `switch((document.documentElement.lang || 'en-US').toLowerCase().replace('_', '-')) {\n`,
					footer: '\n}',
					process: getlocalesprocessor(langcodes)
				}
			},
			// moment.js with locales reduced to the ones we need
			moment: {
				dest: 'temp/moment.js',
				src: 'src/third-party/moment-with-locales.js',
				options: {
					separator: '\n\n',
					banner: '(function() {\n\n',
					footer: '\n\n}).call(ts.ui);',
					process: getmomentprocessor(langcodes)
				}
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
				output: {
					ascii_only: true,
					comments: false
				},
				beautify: false,
				sourceMap: true
			},
			cdn: {
				files: {
					'dist/cdn/ts-<%= pkg.version %>.min.js': 'dist/cdn/ts-<%= pkg.version %>.js'
				}
			}
		},

		postcss: {
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
					list: ['public/ts-<%= pkg.version %>.min.js', 'public/ts-<%= pkg.version %>.min.css']
				}
			}
		},

		// compute SRC hash (based on gzipped files) so they can be shown on the docs website
		// (the docs website will copy this json file into the website once it has been build)
		sri: {
			dev: {
				options: {
					algorithms: ['sha384'],
					dest: 'temp/sri.json',
					pretty: true
				},
				files: [
					{
						src: 'dist/ts.js',
						type: 'text/javascript',
						id: 'js'
					},
					{
						src: 'dist/ts.css',
						type: 'text/css',
						id: 'css'
					}
				]
			},
			cdn: {
				options: {
					algorithms: ['sha384'],
					dest: 'temp/sri.json',
					pretty: true
				},
				files: [
					{
						src: 'public/ts-<%= pkg.version %>.min.js',
						type: 'text/javascript',
						id: 'js'
					},
					{
						src: 'public/ts-<%= pkg.version %>.min.css',
						type: 'text/css',
						id: 'css'
					}
				]
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
				tasks: [].concat(['concurrent:dev_generate_js'], concatAndUglifyJs('dev')),
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
		connect: {
			server: {
				options: {
					keepalive: true,
					port: 10111,
					open: false,
					base: '.'
				}
			}
		},

		// version already uploaded?
		check_cdn: {
			cdn: {
				urls: [
					'<%= process.env.cdn_base || config.cdn_base %>' +
						config.cdn_folder +
						'/ts-<%= pkg.version %>.js',
					'<%= process.env.cdn_base || config.cdn_base %>' +
						config.cdn_folder +
						'/ts-<%= pkg.version %>.min.js',
					'<%= process.env.cdn_base || config.cdn_base %>' +
						config.cdn_folder +
						'/ts-<%= pkg.version %>.min.js.map'
				]
			}
		},

		// execute command line stuff
		exec: {
			compile_less_to_css: {
				command: './node_modules/.bin/lessc src/runtime/less/build.less dist/ts.css',
				stdout: 'inherit'
			},
			s3_upload: {
				command: 'npm run deploy-s3',
				stdout: 'inherit'
			},
			ali_oss_upload: {
				command: 'npm run deploy-ali-oss',
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
			docs: ['connect', 'watch', 'exec:docs_grunt'],
			nodocs: ['connect', 'watch', 'asciify:banner'],
			// Build for CDN
			cdn_generate_js: {
				tasks: generateJsConcurrent('cdn')
			},
			cdn_generate_css_and_concat_js: {
				tasks: generateCssAndConcatJsConcurrent('cdn')
			},
			// Build for dev
			dev_generate_js: {
				tasks: generateJsConcurrent('dev')
			},
			dev_generate_css_and_concat_js: {
				tasks: generateCssAndConcatJsConcurrent('dev')
			},
			// Build for Jasmine
			jasmine_generate_js: {
				tasks: generateJsConcurrent('jasmine')
			},
			jasmine_generate_css_and_concat_js: {
				tasks: generateCssAndConcatJsConcurrent('jasmine')
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
		return target === 'jasmine' ? 'dev' : target;
	}

	function generateJsConcurrent(target = 'cdn') {
		const out = [
			'edbml', // edbml -> js
			`tsless:dev`, // generate ts-runtime.less (needed for Docs!)
			`copy:docs_dev` // copy ts-runtime.less over to the docs (otherwise it will fail)
		];
		if (target === 'cdn') {
			out.push('copy:npm'); // copy LICENSE/README to npm folder
			out.push([
				// generate ts.js
				`tsless:cdn`, // generate ts.less
				`copy:docs_cdn` // copy ts-runtime.less over to the docs
			]);
		}
		out.push('concat:spin'); // generate spin.js
		out.push('guibundles'); // generate ts-runtime-{api,gui}.js
		return out;
	}

	function concatAndUglifyJs(target = 'cdn') {
		const out = [
			`concat:${returnDevForJasmine(target)}` // concat all files generated above
		];
		if (target === 'cdn') {
			out.push(`uglify:cdn`); // uglify
		}
		return out;
	}

	function compileAndMinifyLess(target = 'cdn') {
		let out = [
			'exec:compile_less_to_css' // less -> css
		];
		if (target === 'cdn') {
			out.push('postcss:generate_minified_css'); // css -> min.css
			out.push('copy:css_cdn');
		}
		return out;
	}

	function generateCssAndConcatJsConcurrent(target = 'cdn') {
		return [concatAndUglifyJs(target), compileAndMinifyLess(target)];
	}

	function build(target = 'cdn') {
		let out = [
			`clean:${target}`, // remove files
			'concat:locales', // bundle locale files (synchronously BEFORE moment.js)
			'concat:moment', // compile moment.js (synchronously AFTER locales!)
			`concurrent:${target}_generate_js`,
			`concurrent:${target}_generate_css_and_concat_js`
		];
		switch (target) {
			// compute SHA hashes (in dev mode, for demonstration purposes only)
			case 'dev':
				out.push('sri:dev');
				break;
			case 'cdn':
				// gzip everything, then compute the official SHA hashes
				out.push('compress', 'sri:cdn');
				break;
		}
		return out;
	}

	function sizeReport(target = 'cdn') {
		let out = [];
		if (target === 'cdn') {
			out.push('size_report:cdn_gzip_vs_normal');
			out.push(`size_report:cdn_loaded`);
		}
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
			.concat(build('layout/layout-gui@tradeshift.com/build.json'))
			.concat(build('tables/tables-gui@tradeshift.com/build.json'));
	}

	/**
	 * @returns {Array<string>}
	 */
	function getcombobuilds() {
		return getapibuilds().concat(getguibuilds());
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
			'temp/modules-mix.js',
			'temp/module-edbml.js',
			'temp/ts-runtime-gui.js',
			'temp/edbml-compiled.js',
			'temp/locales.js'
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

	/**
	 * Transform JS inside some file into a `case` inside a `switch` statement
	 * whilst at the same time compiling the list of supported language codes.
	 * @param {Set<string>} codes
	 * @returns {Function}
	 */
	function getlocalesprocessor(codes) {
		return (src, file) => {
			const code = file.match(/ts-lang-(.*)\.js/)[1];
			codes.add(code);
			return (
				`\tcase '${code}':\n` +
				src
					.split('\n')
					.map(line => '\t\t' + line)
					.join('\n') +
				'break;'
			);
		};
	}

	/**
	 * Moment.js has been copy-pasted from the internet with *all* the possible
	 * language codes and that is considerably more than we need, so we'll remove
	 * the unneeded translations based on the list of supported language codes.
	 * These translations fortunately follow a uniform pattern so that we can
	 * simply include or reject them based on advanced analysis of JS comments.
	 * Note: The language code `nb` is equivalent to our wrongly named `no` code.
	 * @param {Set<string>} codes
	 * @returns {Function}
	 */
	function getmomentprocessor(codes) {
		return src => {
			const split = '//! moment.js locale configuration';
			const short = [...codes].map(s => s.split('-')[0]);
			const first = s => (s = s.trim()).slice(0, s.indexOf('\n'));
			const trail = s => s.split('\n});')[1] || '';
			// eslint-disable-next-line no-cond-assign
			const match = s => ((s = s.match(/\[(.*)\]/)) ? s[1] : null);
			const patch = s => s === 'nb';
			const works = s => codes.has(s) || short.includes(s) || patch(s);
			const build = s => works(match(first(s)));
			return src.split(split).reduce((chunks, chunk, i) => {
				return chunks + (i === 0 || build(chunk) ? chunk : trail(chunk));
			}, '');
		};
	}
};
