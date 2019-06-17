const git = require('simple-git');
const semv = require('semver');
const file = require('fs');
const path = require('path');
const octo = require('octonode');
const ZERO = '0.0.0';
const USER = process.env.GH_USER_NAME;
const PASS = process.env.GH_ACCESS_TOK;
const REPO = 'Tradeshift/tradeshift-ui';
const forcesv = process.argv.slice(2)[0] === '-f';
const logtask = msg => console.log(msg);
const getjson = object => JSON.stringify(object, 0, 2);
const abspath = (...paths) => path.join(__dirname, ...paths.map(String));
const delpath = folder => rimraf(abspath(folder));
const ncoding = read => (read ? 'UTF-8' : { ncoding: 'UTF-8' });
const getfile = where => file.readFileSync(where, ncoding(true));
const putfile = (data, where) => file.writeFileSync(where, data, ncoding());
const getpckg = where => JSON.parse(getfile(abspath(where)));
const setpckg = (where, object) => putfile(getjson(object), abspath(where));
const message = ver => `Update docs for v${ver}`;
const verhead = ver => `gh-pages-update/v${ver}`;

/**
 * Confirm environment variables and clean the directory before we start.
 */
(function run() {
	if (USER && PASS) {
		delpath('gh-pages');
		doit(function done() {
			logtask('Cleaning up');
			delpath('gh-pages');
			logtask('Creating PR');
			const ghub = octo.client(PASS);
			const repo = ghub.repo(REPO);
			const vers = localversion('../package.json');
			repo.pr(
				{
					title: message(vers),
					body: '@zdlm @esmailpour-hosein',
					base: 'gh-pages',
					head: verhead(vers)
				},
				function doneDone(err, pr) {
					if (err) {
						return logtask('Something went wrong.', getjson(err));
					}
					logtask('PR created');
					logtask(pr.html_url);
				}
			);
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
	logtask('Cloning "gh-pages"');
	clone('gh-pages').then(() => {
		const thisversion = localversion('../package.json');
		const thatversion = majorversion('gh-pages/package.json', thisversion);
		if (forcesv || semv.gte(thisversion, thatversion)) {
			logtask('Updating website');
			injectdocs('v' + parseInt(thisversion, 10));
			var versions = updateversions('gh-pages/package.json', thatversion, thisversion);
			updateredirect(abspath('gh-pages', 'index.html'), versions);
			pushchanges('gh-pages', thisversion, done);
		} else {
			logtask('ERROR: package.json version must *at least* be equal to the current version');
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
	const repo = `https://${USER}:${PASS}@github.com/${REPO}.git`;
	const args = ['-b', 'gh-pages', '--single-branch'];
	return new Promise(resolve => {
		git(abspath()).clone(repo, branch, args, resolve);
	});
}

/**
 * Parse `package.json` to find this repos version.
 * @param {string} where - Path to `package.json`
 * @returns {string}
 */
function localversion(where) {
	return semv.clean(getpckg(where).version);
}

/**
 * Parse `package.json` to find the version that most
 * closely matches the current version of this branch.
 * @param {string} where - Path to `package.json`
 * @param {string} version - current version (via `localversion` above)
 * @returns {Function}
 */
function majorversion(where, version) {
	const majorver = ver => parseInt(ver, 10);
	const matchver = v => majorver(v) === majorver(version);
	const versions = getpckg(where).versions;
	return versions.map(semv.clean).find(matchver) || ZERO;
}

/**
 * Copy everything from the `docs` folder into the appropiate X
 * folder on `gh-pages` (which is named after the major version).
 * HTML and CSS and JS pages get passed through a function that
 * will rewrite absolute URLs so that they target the X folder.
 * @param {string} version (`v10` or `v13` or something like that)
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
 * @returns {Array<string>} - returns the versions
 */
function updateversions(where, source, target) {
	const pkg = getpckg(where);
	pkg.version = semv.inc(pkg.version, 'patch');
	pkg.versions = pkg.versions
		.map(v => (v === source ? target : v))
		.concat(source === ZERO ? [target] : [])
		.sort(semv.lt);
	setpckg('gh-pages/package.json', pkg);
	return pkg.versions;
}

/**
 * Make the `gh-pages` splash page `index.html` redirect
 * to the newest version which is *not* a pre-release.
 * Note that only the newest version must be marked as
 * pre-release for this to work out, so please don't release
 * any pre-release versions of the old releases from now on.
 */
function updateredirect(where, versions) {
	var vers = parseInt(
		versions.reduce(function(res, ver) {
			return semv.prerelease(res) !== null ? ver : res;
		}, versions[0]),
		10
	);
	var html = getfile(where).replace(/URL=\/v(\d*)\//, `URL=/v${vers}/`);
	putfile(html, where);
}

/**
 * Commit everything and push to remote branch.
 * You should now do a manual PR to `gh-pages`!
 * @param {string} source Base Branch
 * @param {string} version Version we're creating
 * @param {Function} done
 */
function pushchanges(source, version, done) {
	const target = verhead(version);
	logtask('Pushing', target);
	git(abspath(source))
		.branch([target])
		.checkout(target)
		.add('./*')
		.commit(message(version))
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
	putfile(parser(getfile(source)), target);
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
			putfile(parser(getfile(src)), dest);
			break;
		default:
			file.linkSync(src, dest);
			break;
	}
}
