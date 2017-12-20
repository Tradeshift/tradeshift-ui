const Git = require('nodegit');
const file = require('fs');
const path = require('path');
const temp = path.join(__dirname, 'repo');

/**
 * @see http://www.nodegit.org/guides/cloning/
 */
const cloneOptions = {
	checkoutBranch: 'gh-pages',
	fetchOpts: {
		callbacks: {
			certificateCheck() {
				return 1;
			}
		}
	}
};

/**
 * @returns {Object}
 */
function getpackage() {
	return JSON.parse(file.readFileSync(path.join(__dirname, '../package.json'), 'UTF-8'));
}

clone('https://github.com/Tradeshift/tradeshift-ui.git').then(repo => {
	const version = parseInt(getpackage().version, 10);
	const docsdir = path.join(temp, version);
	if (!path.existsSync(docsdir)) {
		file.mkdirSync(docsdir);
	}
	console.log('Is the repository bare? %s', Boolean(repo.isBare()));
});

/**
 * @param {string} url
 * @returns {Promise}
 */
function clone(url) {
	return Git.Clone(url, temp, cloneOptions).catch(x => {
		console.log(x);
	});
}

/*
console.log(`Cloning ${url}...`);
Git.Clone(url, tmp, cloneOptions).then(repository => {
	console.log("Is the repository bare? %s", Boolean(repository.isBare()));
}).catch(x => {
	console.log(x);
});
*/

/**
 * Setup ts.js (the JS and CSS bootloader).
 *
module.exports = {
	init: function(grunt) {
		grunt.registerMultiTask('ghpages', 'MoTh RuLeZ!', () => {
			console.log(Git);
			const options = this.options();
			Object.keys(options).forEach(function(key) {
				options[key] = grunt.template.process(options[key]).replace(localhost, publichost);
			});
			this.files.forEach(function(pair) {
				tsjs(grunt, pair.src[0], pair.dest, options);
			});
		});
	}
};
*/
