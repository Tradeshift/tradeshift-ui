const git = require('simple-git');
const semv = require('semver');
const file = require('fs');
const path = require('path');
const ZERO = '0.0.0';

exports.update = function() {
	reset();
	console.log('Cloning gh-pages');
	clone('gh-pages').then(() => {
		console.log('Comparing versions');
		const thisversion = getlocalversion();
		const thatversion = getmatchversion(thisversion);
		if (semv.gt(thisversion, thatversion)) {
			console.log('Updating website');
			injectdocs(parseInt(thisversion, 10));
			setmatchversion(thatversion, thisversion);
			pushchanges('gh-pages', 'gh-pages-update');
		} else {
			console.log('Update aborted');
		}
		reset();
	});
};

/**
 * @param {string} branch
 * @returns {Promise}
 */
function clone(branch) {
	const repo = 'https://github.com/Tradeshift/tradeshift-ui.git';
	const args = ['-b', 'gh-pages', '--single-branch'];
	return new Promise(resolve => {
		git(getabspath()).clone(repo, branch, args, resolve);
	});
}

function pushchanges(source, target) {
	console.log('Pushing', target);
	git(getabspath(source))
		.branch([target])
		.checkout(target)
		.add('./*')
		.commit('Update gh-pages')
		.push('origin', target);
}

function reset() {
	console.log('Cleaning up');
	rimraf(getabspath('gh-pages'));
}

function getlocalversion() {
	return semv.clean(getpackage('../package.json').version);
}

function getmatchversion(version) {
	const match = v => parseInt(v, 10) === parseInt(version, 10);
	return (
		getpackage('gh-pages/package.json')
			.versions.map(semv.clean)
			.find(match) || ZERO
	);
}

function injectdocs(version) {
	prepare(version);
	copydist(version);
	copyindex(version);
}

function setmatchversion(source, target) {
	const pkg = getpackage('gh-pages/package.json');
	pkg.version = semv.inc(pkg.version, 'patch');
	pkg.versions = pkg.versions
		.map(v => (v === source ? target : v))
		.concat(source === ZERO ? [target] : [])
		.sort(semv.gt);
	console.log('versions', pkg.versions);
	setpackage('gh-pages/package.json', pkg);
}

/**
 * @param {string} version
 */
function prepare(version) {
	const target = getabspath('gh-pages', version);
	if (file.existsSync(target)) {
		rimraf(target);
	}
	file.mkdirSync(target);
}

/**
 * @param {string} version
 */
function copydist(version) {
	return copydir(getabspath('../', 'docs', 'dist'), getabspath('gh-pages', version, 'dist'));
}

/**
 * @param {string} version
 */
function copyindex(version) {
	file.linkSync(
		getabspath('../', 'docs', 'index.html'),
		getabspath('gh-pages', version, 'index.html')
	);
}

/**
 * @param {...string} [paths]
 * @returns {string}
 */
function getabspath(...paths) {
	return path.join(__dirname, ...paths.map(String));
}

/**
 * @returns {Object}
 */
function getpackage(where) {
	return JSON.parse(file.readFileSync(getabspath(where), 'UTF-8'));
}

function setpackage(where, object) {
	file.writeFileSync(getabspath(where), JSON.stringify(object, 0, 2), { encoding: 'UTF-8' });
}

/**
 * Remove directory recursively
 * @param {string} dir
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
function copydir(src, dest, result = []) {
	var exist = file.existsSync(src);
	var stats = exist && file.statSync(src);
	var isDirectory = exist && stats.isDirectory();
	if (exist && isDirectory) {
		file.mkdirSync(dest);
		file.readdirSync(src).forEach(function(name) {
			copydir(path.join(src, name), path.join(dest, name), result);
		});
	} else {
		file.linkSync(src, dest);
		result.push(dest);
	}
	return result;
}
