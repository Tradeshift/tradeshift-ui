const git = require('simple-git');
const semv = require('semver');
const file = require('fs');
const path = require('path');
const ZERO = '0.0.0';
const REPO = 'https://github.com/Tradeshift/tradeshift-ui.git';
const LEAF = 'gh-pages-update';

reset();
git(getfolder()).clone(REPO, 'gh-pages', ['-b', 'gh-pages', '--single-branch'], () => {
	const thisversion = getlocalversion();
	const thatversion = getmatchversion(thisversion);
	if (semv.gt(thisversion, thatversion)) {
		inject(parseInt(thisversion, 10));
		setmatchversion(thatversion, thisversion);
		/*
		git(getfolder('gh-pages'))
			.status((error, status) => {
				// console.log(error || status);
				console.log(process.env.GH_ACCESS_TOK);
			});
		*/
		git(getfolder('gh-pages'))
			.branch([LEAF])
			.checkout(LEAF)
			.add('./*')
			.status((error, status) => {
				console.log(error || status);
			})
			.branch(['-d', LEAF]);
	} else {
		console.log('Nothing to see');
		reset();
	}
});

function reset() {
	console.log('Cleaning up');
	rimraf(getfolder('gh-pages'));
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

function inject(version) {
	prepare(version);
	copydist(version);
	copyindex(version);
}

function setmatchversion(source, target) {
	const pkg = getpackage('gh-pages/package.json');
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
	const target = getfolder('gh-pages', version);
	if (file.existsSync(target)) {
		rimraf(target);
	}
	file.mkdirSync(target);
}

/**
 * @param {string} version
 */
function copydist(version) {
	return copydir(getfolder('../', 'docs', 'dist'), getfolder('gh-pages', version, 'dist'));
}

/**
 * @param {string} version
 */
function copyindex(version) {
	file.linkSync(
		getfolder('../', 'docs', 'index.html'),
		getfolder('gh-pages', version, 'index.html')
	);
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
function getpackage(where) {
	return JSON.parse(file.readFileSync(getfolder(where), 'UTF-8'));
}

function setpackage(where, object) {
	console.log(where);
	console.log(JSON.stringify(object, 0, 2));
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
