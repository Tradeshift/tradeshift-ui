const processor = require('./tasks/processor');
const publisher = require('./tasks/publisher');
const btunneler = require('./tasks/tuneller.js');
const bsshooter = require('./tasks/shooter.js');
const cheerio = require('cheerio');
const path = require('path');
const fs = require('fs');
const S = require('string');

var stackconf = {
	username: process.env.BROWSERSTACK_USERNAME,
	accessKey: process.env.BROWSERSTACK_KEY
};

var antiClickjack = [
	'<style id="antiClickjack">body{display:none !important;}</style>',
	'<script type="text/javascript">',
	'			if (self === top) {',
	"				var antiClickjack = document.getElementById('antiClickjack');",
	'				antiClickjack.parentNode.removeChild(antiClickjack);',
	'			} else {',
	'				top.location = self.location;',
	'			}',
	'		</script>'
];

/**
 * @param {Grunt} grunt
 */
module.exports = function(grunt) {
	'use strict';
	// autoload everything that looks like Grunt tasks
	require('load-grunt-tasks')(grunt);

	// read config and apply local overrides (gitignored!)
	var config = require('./tasks/config')
		.init(grunt)
		.merge('config.json', 'config.local.json');
	// get version number directly from the package.json of the runtime
	config.runtime_version = require('../package.json').version;

	// Config ....................................................................

	grunt.config.init({
		// for grunt template.process()
		config: config,

		// for browserstack screenshots
		stackconf: stackconf,

		// tags to include in HEAD when building for local development
		localtags: [
			'<meta charset="UTF-8">',
			'<meta name="viewport" content="width=device-width"/>',
			'<script src="//127.0.0.1:10111/dist/ts.js"></script>',
			'<script src="/dist/assets/dox.js"></script>',
			'<script src="/dist/assets/mark.min.js"></script>',
			'<script src="/dist/assets/jquery-2.2.4.min.js"></script>',
			'<link rel="stylesheet" href="//127.0.0.1:10111/dist/ts.css"/>',
			'<link rel="stylesheet" href="/dist/assets/dox.css"/>'
		],

		// tags to include in HEAD when publishing to GitHub pages
		publictags: [
			'<meta charset="UTF-8">',
			'<meta name="viewport" content="width=device-width"/>',
			'<script src="<%=config.runtime_hosting%>/ts-<%=config.runtime_version%>.min.js"></script>',
			'<script src="/dist/assets/dox.min.js"></script>',
			'<script src="/dist/assets/mark.min.js"></script>',
			'<script src="/dist/assets/jquery-2.2.4.min.js"></script>',
			'<link rel="stylesheet" href="<%=config.runtime_hosting%>/ts-<%=config.runtime_version%>.min.css"/>',
			'<link rel="stylesheet" href="/dist/assets/dox.css"/>'
		],

		// nuke previous build
		clean: {
			dist: ['dist/**'],
			screenshots_local: ['screenshots/local/**'],
			screenshots_release: ['screenshots/release/**']
		},

		connect: {
			server: {
				options: {
					keepalive: true,
					port: 10114,
					open: true,
					base: '.'
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
					'temp/dox-api.js': ['src/js/dox-api@tradeshift.com/build.json'],
					'temp/dox-gui.js': ['src/js/dox-gui@tradeshift.com/build.json']
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
					'temp/dox-edbml.js': ['src/edbml/*.edbml']
				}
			}
		},

		copy: {
			target_local: getindexconfig('localtags'),
			target_public: getindexconfig('publictags'),
			sri: {
				src: '../temp/sri.json',
				dest: 'dist/sri.json'
			},
			libs: {
				files: [
					{
						expand: true,
						cwd: 'src/js/',
						dest: 'dist/assets/',
						src: [
							'angular-1.3.6.min.js',
							'jquery-2.2.4.min.js',
							'template.js',
							'lunr.min.js',
							'mark.min.js',
							'icon.svg'
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
						src: ['**', '!**/*.xhtml', '!**/*.less']
					}
				]
			}
		},

		uglify: {
			options: {
				sourceMap: true,
				mangle: false,
				output: {
					ascii_only: true,
					comments: false
				}
			},
			dox: {
				files: {
					'dist/assets/dox.min.js': ['temp/dox-api.js', 'temp/dox-gui.js', 'temp/dox-edbml.js']
				}
			}
		},

		concat: {
			local: {
				files: {
					'dist/assets/dox.js': ['temp/dox-api.js', 'temp/dox-gui.js', 'temp/dox-edbml.js']
				}
			}
		},

		exec: {
			less_global: {
				command: './node_modules/.bin/lessc src/less/ts-docs.less dist/assets/dox.css'
			},
			less_local: {
				command: function() {
					// @see https://gist.github.com/kethinov/6658166
					const walkSync = function(dir, filelist) {
						const files = fs.readdirSync(dir);
						filelist = filelist || [];
						files.forEach(function(file) {
							if (fs.statSync(dir + file).isDirectory()) {
								filelist = walkSync(dir + file + '/', filelist);
							} else if (/.*\.less$/.test(file.toLowerCase())) {
								filelist.push(dir + file);
							}
						});
						return filelist;
					};

					return walkSync('src/xhtml/')
						.map(
							f =>
								`./node_modules/.bin/lessc ${f} ${f
									.replace('src/xhtml/', 'dist/')
									.replace('.less', '.css')}`
						)
						.join('& ');
				}
			}
		},

		watch: {
			js_global: {
				files: 'src/js/**/*.js',
				tasks: ['guibundles', 'concat:local', 'uglify'],
				options: { debounceDelay: 250 }
			},
			js_local: {
				files: 'src/xhtml/**/*.js',
				tasks: ['copy:pageassets'],
				options: { debounceDelay: 250 }
			},
			css_global: {
				files: 'src/less/**/*.less',
				tasks: ['exec:less_global'],
				options: { debounceDelay: 250 }
			},
			css_local: {
				files: 'src/xhtml/**/*.less',
				tasks: ['exec:less_local'],
				options: { debounceDelay: 250 }
			},
			edbml: {
				files: 'src/edbml/**/*.edbml',
				tasks: ['edbml:outline', 'concat'],
				options: { debounceDelay: 250 }
			},
			xhtml: {
				files: ['src/xhtml/**/*', 'tasks/processor.js'],
				tasks: ['copy:target_local', 'edbml:target_local', 'exec:less_local'],
				options: { debounceDelay: 250 }
			},
			json: {
				files: 'menu.json',
				tasks: ['copy:target_local'],
				options: { debounceDelay: 250 }
			}
		},

		linkChecker: {
			dev: {
				site: 'localhost',
				options: {
					initialPort: 10114,
					initialPath: '/index.html',
					callback: function(crawler) {
						crawler.addFetchCondition(function(url) {
							var ext = path.extname(url.path);
							return url.port === '10114' && (ext === '.html' || !ext);
						});
					}
				}
			}
		},

		concurrent: {
			localdev: {
				tasks: ['connect', 'watch', 'asciify:banner'],
				options: {
					logConcurrentOutput: true
				}
			}
		},

		tunneler: {
			options: {
				key: '<%=stackconf.accessKey%>',
				hosts: [
					{
						name: 'localhost',
						port: 10114,
						sslFlag: 0
					}
				]
			}
		},

		shooter: {
			options: {
				user: '<%=stackconf.username%>',
				key: '<%=stackconf.key%>',
				browsers: [
					'WIN8: firefox',
					'WIN8: chrome',
					'MAC: safari',
					'WIN8: internet explorer 11',
					'ANY: edge'
					// 'ANY: android',
					// 'ANY: iPhone',
					// 'ANY: iPad',
					// 'ANY: opera'
				]
			},
			release: {
				options: {
					folder: 'screenshots/release/'
				}
			},
			local: {
				options: {
					folder: 'screenshots/local/',
					compare: 'screenshots/release/',
					differs: 'screenshots/diffs/'
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
			src: ['**/*.xhtml', '!assets/**'],
			options: {
				inline: true,
				beautify: true,
				attribute: 'data-ts',
				process: function(html, source) {
					var tags = grunt.template.process('<%=' + tagset + '%>');
					return processor
						.process(html, tags, source)
						.replace(/\${gTagCode}/g, tagset === 'publictags' ? 'UA-127106947-1' : '');
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
				process: function(content) {
					var tags = grunt.template.process('<%=' + tagset + '%>');
					var menu = grunt.file.readJSON('menu.json');
					var svgs = grunt.file.read('src/svg/icons.svg');
					var json = JSON.stringify(menu, 0, 0);
					tags = tags.replace(/,/g, '\n		');
					return publisher.publish(
						content
							.replace('${includes}', tags)
							.replace('${menujson}', json)
							.replace('${svgicons}', svgs.replace(/\n\n*/g, '\n'))
							.replace('${menuhtml}', seomenu(menu))
							.replace('${security}', antiClickjack.join('\n'))
					);
				}
			}
		};
	}

	/**
	 * Outputting the menu via `link` tags so that Google can crawl
	 * us and the `grunt link` task can be used to check everything.
	 * Note that these link should not `prefetch` because that will
	 * slow down the loading of the (first loaded) iframe.
	 * @param {Array<object>} items
	 */
	function seomenu(items) {
		const NEW = '\n\t\t';
		return items.reduce((html, item, i) => {
			if (!item.hidden) {
				if (item.path) {
					html += `<link rel="robots" href="/dist/${item.path}"/>${NEW}`;
				}
				if (item.items) {
					html += seomenu(item.items);
				}
			}
			return html;
		}, '');
	}

	// Tasks .....................................................................

	// local development (don't commit this to Git!)
	grunt.task.registerTask('default', xxx('target_local').concat(['concurrent']));

	// important: Run this before committing to Git!
	grunt.task.registerTask('dist', xxx('target_public'));

	grunt.task.registerTask('dist:run', xxx('target_public').concat(['concurrent']));

	grunt.registerTask('links', ['linkChecker']);

	// local screenshots (compare current code with the latest release)
	grunt.task.registerTask('screenshots:local', [
		'clean:screenshots_local',
		'tunneler',
		'shooter:local',
		'tunneler:stop'
	]);

	// add new screenshot "benchmark" TODO: hook this into the `grunt:release` system
	grunt.task.registerTask('screenshots:release', [
		'clean:screenshots_release',
		'tunneler',
		'shooter:release',
		'tunneler:stop'
	]);

	// begin screenshots
	grunt.task.registerTask('tunneler', 'Start BrowserStackTunnel', function() {
		btunneler.start(this.options(), this.async());
	});

	// perform screenshots
	grunt.task.registerMultiTask('shooter', 'Start screenshot session', function() {
		bsshooter.shoot(this.options(), this.async());
	});

	// end screenshots
	grunt.task.registerTask('tunneler:stop', 'Stop BrowserStackTunnel', function() {
		btunneler.stop(this.async());
	});

	/**
	 * Build task list.
	 * @param {string } tags
	 * @returns {Array<string>}
	 */
	grunt.task.registerTask('lunr', 'generate lunr index', function() {
		var prefix = 'dist/';
		grunt.log.writeln('Build pages index');
		function indexPages() {
			var pagesIndex = [];
			grunt.file.recurse(prefix, function(abspath, rootdir, subdir, filename) {
				/**
				 * Don't parse the hidden design docs
				 */
				if (abspath.includes('dist/design')) {
					return;
				}
				grunt.verbose.writeln('Parse file:', abspath);
				pagesIndex.push(processFile(abspath, filename));
			});
			return pagesIndex;
		}
		function processFile(abspath, filename) {
			var pageIndex;

			if (S(filename).endsWith('.html')) {
				pageIndex = processHTMLFile(abspath, filename);
			}
			return pageIndex;
		}
		function ignoreHTML(raw) {
			var ix1 = raw.indexOf('<body>');
			var ix2 = raw.indexOf('</body>') + '</body>'.length;
			var dom = cheerio.load(raw.substring(ix1, ix2));
			return dom.root().text();
		}

		function processHTMLFile(abspath, filename) {
			var raw = grunt.file.read(abspath);
			if (!(raw.includes('robots') && raw.includes('noindex'))) {
				var content = ignoreHTML(raw);

				// var title = require('string')(raw).between('<title>', '</title>').s;
				var title;
				var left = '<title>';
				var right = '</title>';
				var startPos = raw.indexOf(left);
				var endPos = raw.indexOf(right, startPos + left.length);
				if (endPos === -1 && !!right) {
					title = '';
				} else if (endPos === -1 && !right) {
					title = raw.substring(startPos + left.length);
				} else {
					title = raw.slice(startPos + left.length, endPos);
				}

				// var href = require('string')(abspath).chompLeft(prefix).s;
				var href = abspath;
				if (abspath.indexOf(prefix) === 0) {
					href = abspath.slice(prefix.length);
				}

				// content = require('string')(content).trim().stripTags().stripPunctuation().s;
				content = content
					.trim()
					.replace(RegExp('</?[^<>]*>', 'gi'), '')
					.replace(/[^\w\s]|_/g, '')
					.replace(/\s+/g, ' ');

				return {
					title: title,
					href: href,
					content: content
				};
			}
		}
		grunt.file.write('dist/lunr.json', JSON.stringify(indexPages()));
		grunt.log.ok('Index built');
	});

	/**
	 * Build task list.
	 * @param {string } tags
	 * @returns {Array<string>}
	 */
	function xxx(tags) {
		var out = [
			'clean:dist',
			'guibundles',
			'edbml:outline',
			'edbml:' + tags,
			'copy:' + tags,
			'copy:libs',
			'copy:pageassets',
			'copy:sri'
		];
		if (tags === 'target_public') {
			out.push('uglify');
		} else if (tags === 'target_local') {
			out.push('concat:local');
		}
		out.push('exec:less_global');
		out.push('exec:less_local');
		out.push('lunr');
		return out;
	}
};
