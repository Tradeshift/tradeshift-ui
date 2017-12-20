const Git = require('nodegit');
const file = require('fs');
const path = require('path');
const temp = path.join(__dirname, 'repo');

console.log('DELETE');
rimraf(temp);
console.log('OK');

clone('https://github.com/Tradeshift/tradeshift-ui.git').then(repo => {
	console.log('Success!');
	const version = parseInt(getpackage().version, 10);
	try {
		ensure(version);
		copydist(version);
		copyindex(version);
	} catch (exception) {
		console.log(exception);
	}
});

/**
 * @param {string} version
 */
function ensure(version) {
	if (!file.existsSync(getfolder('repo', version))) {
		file.mkdirSync(getfolder('repo', version));
	}
}

/**
 * @param {string} version
 */
function copydist(version) {
	copydir(getfolder('../', 'docs', 'dist'), getfolder('repo', version, 'dist'));
}

/**
 * @param {string} version
 */
function copyindex(version) {
	file.linkSync(getfolder('../', 'docs', 'index.html'), getfolder('repo', version, 'index.html'));
}

/**
 * @param {...string} [paths]
 * @returns {string}
 */
function getfolder(...paths) {
	return path.join(__dirname, ...paths.map(String));
}

/**
 * @returns {Object}
 */
function getpackage() {
	return JSON.parse(file.readFileSync(path.join(__dirname, '../package.json'), 'UTF-8'));
}

/**
 * @see http://www.nodegit.org/guides/cloning/
 * @param {string} url
 * @returns {Promise}
 */
function clone(url) {
	console.log('Cloning', url);
	return Git.Clone(url, getfolder('repo'), {
		checkoutBranch: 'gh-pages',
		fetchOpts: {
			callbacks: {
				certificateCheck() {
					return 1;
				}
			}
		}
	}).catch(x => {
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
 * Copy directory recursively.
 * @param {string} src
 * @param {string} dest
 */
function copydir(src, dest) {
	var exist = file.existsSync(src);
	var stats = exist && file.statSync(src);
	var isDirectory = exist && stats.isDirectory();
	if (exist && isDirectory) {
		file.mkdirSync(dest);
		file.readdirSync(src).forEach(function(name) {
			copydir(path.join(src, name), path.join(dest, name));
		});
	} else {
		file.linkSync(src, dest);
	}
}
