const git = require('simple-git');
const semv = require('semver');
const file = require('fs');
const path = require('path');
const ZERO = '0.0.0';
const USER = process.env.GH_USER_NAME;
const PASS = process.env.GH_ACCESS_TOK;
const REPO = 'github.com/Tradeshift/tradeshift-ui.git';
const tojson = object => JSON.stringify(object, 0, 2);
const abspath = (...paths) => path.join(__dirname, ...paths.map(String));
const encoding = read => (read ? 'UTF-8' : { encoding: 'UTF-8' });
const readfile = where => file.readFileSync(where, encoding(true));
const writefile = (data, where) => file.writeFileSync(where, data, encoding());
const nukefolder = folder => rimraf(abspath(folder));
const getpackage = where => JSON.parse(readfile(abspath(where)));
const setpackage = (where, object) => writefile(tojson(object), abspath(where));
const localversion = where => semv.clean(getpackage(where).version);

/**
 * Confirm environment variables and clean the directory before we start.
 */
(function run() {
	if (USER && PASS) {
		nukefolder('gh-pages');
		doit(function done() {
			console.log('Cleaning up');
			nukefolder('gh-pages');
		});
	} else {
		USER || console.error('GH_USER_NAME missing!');
		PASS || console.error('GH_ACCESS_TOK missing!');
	}
})();

/**
 * Clone the repo, match the versions, copy files and push to new branch.
 * @param {Function} done
 */
function doit(done) {
	console.log('Cloning "gh-pages"');
	clone('gh-pages').then(() => {
		const thisversion = localversion('../package.json');
		const thatversion = majorversion('gh-pages/package.json', thisversion);
		if (semv.gt(thisversion, thatversion)) {
			console.log('Updating website');
			injectdocs(parseInt(thisversion, 10));
			updateversions('gh-pages/package.json', thatversion, thisversion);
			pushchanges('gh-pages', 'gh-pages-update', done);
		} else {
			done();
		}
	});
}

/**
 * Clone the repo into a local folder and checkout the `gh-pages` branch.
 * @param {string} branch
 * @returns {Promise}
 */
function clone(branch) {
	const repo = `https://${USER}:${PASS}@${REPO}`;
	const args = ['-b', 'gh-pages', '--single-branch'];
	return new Promise(resolve => {
		git(abspath()).clone(repo, branch, args, resolve);
	});
}

/**
 * Parse `package.json` to find the version that most 
 * closely matches the current version of this branch.
 * @param {string} where - Path to `package.json`
 * @returns {Function}
 */
function majorversion(where, version) {
	const majorver = ver => parseInt(ver, 10);
	const matchver = v => majorver(v) === majorver(version);
	const versions = getpackage(where).versions;
	return versions.map(semv.clean).find(matchver) || ZERO;
}

/**
 * Copy everything from the `docs` folder into the appropiate X
 * folder on `gh-pages` (which is named after the major version).
 * HTML and CSS and JS pages get passed through a function that 
 * will rewrite absolute URLs so that they target the X folder.
 * @param {number} version
 */
function injectdocs(version) {
	const parser = data => data.replace(/\/dist\//g, `/${version}/dist/`);
	prepare(version);
	copydist(version, parser);
	copyindex(version, parser);
}

/**
 * Update the `versions` array in `package.json`
 * @param {string} where - Path to JSON
 * @param {string} source - version before the update
 * @param {string} target - version after the update
 */
function updateversions(where, source, target) {
	const pkg = getpackage(where);
	pkg.version = semv.inc(pkg.version, 'patch');
	pkg.versions = pkg.versions
		.map(v => (v === source ? target : v))
		.concat(source === ZERO ? [target] : [])
		.sort(semv.gt);
	setpackage('gh-pages/package.json', pkg);
}

/**
 * Commit everything and push to remote branch. 
 * You should now do a munual PR to `gh-pages`!
 * @param {string} source
 * @param {string} source
 * @param {Funciton} done
 */
function pushchanges(source, target, done) {
	console.log('Pushing', target);
	git(abspath(source))
		.branch([target])
		.checkout(target)
		.add('./*')
		.commit('Update gh-pages')
		.push('origin', target, done);
}

/**
 * Prepare the X folder (named after the major version).
 * @param {string} version
 */
function prepare(version) {
	const target = abspath('gh-pages', version);
	if (file.existsSync(target)) {
		rimraf(target);
	}
	file.mkdirSync(target);
}

/**
 * Copy and potentially parse all the things.
 * @param {number} version
 * @param {Function} parser
 */
function copydist(version, parser) {
	const source = abspath('../', 'docs', 'dist');
	const target = abspath('gh-pages', version, 'dist');
	copydir(source, target, parser);
}

/**
 * Parse and write the `index.html` file.
 * @param {number} version
 * @param {Function} parser
 */
function copyindex(version, parser) {
	const source = abspath('../', 'docs', 'index.html');
	const target = abspath('gh-pages', version, 'index.html');
	writefile(parser(readfile(source)), target);
}

/**
 * Remove directory recursively.
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
 * @param {Functtion} parser
 */
function copydir(src, dest, parser) {
	const exist = file.existsSync(src);
	const stats = exist && file.statSync(src);
	const isDirectory = exist && stats.isDirectory();
	if (exist && isDirectory) {
		file.mkdirSync(dest);
		file.readdirSync(src).forEach(function(name) {
			copydir(path.join(src, name), path.join(dest, name), parser);
		});
	} else {
		copyfile(src, dest, parser);
	}
}

/**
 * Copy file. Unless it is a HTML or CSS or JS file, 
 * in which case we run it throught that parser first.
 * @param {string} src
 * @param {string} dest
 * @param {Functtion} parser
 */
function copyfile(src, dest, parser) {
	switch (path.extname(src)) {
		case '.html':
		case '.css':
		case '.js':
			writefile(parser(readfile(src)), dest);
			break;
		default:
			file.linkSync(src, dest);
			break;
	}
}
