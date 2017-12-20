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

function getfolder(...paths) {
	return path.join(__dirname, 'repo', ...paths.map(String));
}

/**
 * @returns {Object}
 */
function getpackage() {
	return JSON.parse(file.readFileSync(path.join(__dirname, '../package.json'), 'UTF-8'));
}

console.log('DELETE');
rimraf(temp);

clone('https://github.com/Tradeshift/tradeshift-ui.git').then(repo => {
	console.log('Success!');
	try {
		const version = parseInt(getpackage().version, 10);
		const docsdir = getfolder(version);
		console.log(`Copying into ${docsdir}`);
		if (!file.existsSync(docsdir)) {
			console.log('Creating new dir');
			file.mkdirSync(docsdir);
		}
		console.log('Is the repository bare? %s', Boolean(repo.isBare()));
	} catch (x) {
		console.log(x);
	}
});

/**
 * @param {string} url
 * @returns {Promise}
 */
function clone(url) {
	console.log('Cloning', url);
	return Git.Clone(url, getfolder(), cloneOptions).catch(x => {
		console.log(x);
	});
}

/**
 * Remove directory recursively
 * @param {string} dir_path
 * @see https://stackoverflow.com/a/42505874/3027390
 */
function rimraf(dir) {
	if (file.existsSync(dir)) {
		file.readdirSync(dir).forEach(function(entry) {
			var entry_path = path.join(dir, entry);
			if (file.lstatSync(entry_path).isDirectory()) {
				rimraf(entry_path);
			} else {
				file.unlinkSync(entry_path);
			}
		});
		file.rmdirSync(dir);
	}
}

/**
 * 
 * @param {string} src
 * @param {string} dest
 *
function copy(src, dest) {
	var exist = file.existsSync(src);
	var stats = exist && file.statSync(src);
	var isDirectory = exist && stats.isDirectory();
	if (exist && isDirectory) {
		file.mkdirSync(dest);
		file.readdirSync(src).forEach(function(childItemName) {
			copy(path.join(src, childItemName), path.join(dest, childItemName));
		});
	} else {
		file.linkSync(src, dest);
	}
}
*/

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
