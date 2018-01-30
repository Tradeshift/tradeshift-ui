const processor = require('./tasks/processor');
const publisher = require('./tasks/publisher');
const btunneler = require('./tasks/tuneller.js');
const bsshooter = require('./tasks/shooter.js');
const cheerio = require('cheerio');
const path = require('path');
const S = require('string');

var stackconf = {
	username: process.env.BROWSERSTACK_USERNAME,
	accessKey: process.env.BROWSERSTACK_KEY
};

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
			libs: {
				files: [
					{
						expand: true,
						cwd: 'src/js/',
						dest: 'dist/assets/',
						src: ['angular-1.3.6.min.js', 'jquery-2.2.4.min.js', 'lunr.min.js', 'mark.min.js']
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

		less: {
			global: {
				files: {
					'dist/assets/dox.css': 'src/less/ts-docs.less'
				}
			},
			local: {
				options: {
					paths: 'src/less' // not working :/
				},
				files: [
					{
						expand: true,
						cwd: 'src/xhtml/',
						src: ['**/*.less'],
						dest: 'dist',
						ext: '.css'
					}
				]
			}
		},

		watch: {
			js_global: {
				files: 'src/js/**/*.js',
				tasks: ['guibundles', 'concat:local'],
				options: { debounceDelay: 250 }
			},
			js_local: {
				files: 'src/xhtml/**/*.js',
				tasks: ['copy:pageassets'],
				options: { debounceDelay: 250 }
			},
			css: {
				files: 'src/less/**/*.less',
				tasks: ['less'],
				options: { debounceDelay: 250 }
			},
			edbml: {
				files: 'src/edbml/**/*.edbml',
				tasks: ['edbml:outline', 'uglify'],
				options: { debounceDelay: 250 }
			},
			xhtml: {
				files: ['src/xhtml/**/*', 'tasks/processor.js'],
				tasks: ['copy:target_local', 'edbml:target_local', 'less:local'],
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
				process: function(content, srcpath) {
					var tags = grunt.template.process('<%=' + tagset + '%>');
					var menu = grunt.file.readJSON('menu.json');
					var svgs = grunt.file.read('src/svg/icons.svg');
					var json = JSON.stringify(menu, null, null);
					tags = tags.replace(/,/g, '\n		');
					return publisher.publish(
						content
							.replace('${includes}', tags)
							.replace('${menujson}', json)
							.replace('${svgicons}', svgs.replace(/\n\n*/g, '\n'))
							.replace('${menuhtml}', seomenu(JSON.parse(json)))
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
				var title = S(raw).between('<title>', '</title>').s;
				var href = S(abspath).chompLeft(prefix).s;
				return {
					title: title,
					href: href,
					content: S(content)
						.trim()
						.stripTags()
						.stripPunctuation().s
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
			'copy:pageassets'
		];
		if (tags === 'target_public') {
			out.push('uglify');
		} else if (tags === 'target_local') {
			out.push('concat:local');
		}
		out.push('less');
		out.push('lunr');
		return out;
	}
};
