[![travis.org Build Status](https://travis-ci.org/Tradeshift/tradeshift-ui.svg?branch=master)](https://travis-ci.org/Tradeshift/tradeshift-ui) [![devDependencies](https://img.shields.io/david/dev/Tradeshift/tradeshift-ui.svg?style=flat-square)](https://david-dm.org/Tradeshift/tradeshift-ui/?type=dev)

---

# [Tradeshift UI](https://ui.tradeshift.com)

Tradeshift UI is a UI library to help you create apps that implement the [Tradeshift Design Principles](https://ui.tradeshift.com/#design/). Check out our [documentation site](https://ui.tradeshift.com) to learn more about how it works and try out live code examples.

If you want to know about what the latest version is and what's new, check out our [releases page](http://github.com/Tradeshift/tradeshift-ui/releases).

If you'd like to submit a feature request or report a bug, go to our [issues pages](http://github.com/Tradeshift/tradeshift-ui/issues).

## Installation

1. Clone this repository
1. Install [NodeJS](https://nodejs.org/), either LTS or current.
1. Install the Grunt Command Line Utility globally.
   - `npm install -g grunt-cli`
1. Install the dependencies of this project.
   - `npm install`

## Usage (Local Development)

1. Start the `grunt` script in the root of the repository.
   - `grunt`
1. Use [`http://localhost:10111/dist/ts.js`](`http://localhost:10111/dist/ts.js`) in your app running locally to initialize Tradeshift UI.
1. Whenever you modify the source files, the script will rebuild the distribution files in `dist/` so you're always using the latest version.

### Optional steps to run the documentation site locally

1. Run `grunt dev` (instead of just `grunt`) and the documentantion website will open up on [`http://localhost:10114/`](http://localhost:10114/)
1. Whenever you modify the source files, the script will rebuild the documentation so you're always using the latest version.

## Git Hooks

Watch out, whenever you create a commit, the pre-commit hook will lint all staged files and it might commit all changes in each staged file, not just the staged lines.

## Docs

Our docs site is hosted by GitHub Pages at https://ui.tradeshift.com.

## Release & Deployment

Make sure you are logged in to `npm` and you have the following environment variables set:

```sh
export AWS_ACCESS_KEY_ID=[Your AWS access key id]
export AWS_SECRET_ACCESS_KEY=[Your AWS secret access key]
export GH_ACCESS_TOK=[Your GitHub personal access token]
```

Releasing can be started using one of the following commands:

```sh
# Let's say the current version is v10.0.0

# npm dist-tag ls
# latest: 10.0.0

	# Bump the patch version and release
	> npm run release

# npm dist-tag ls
# latest: 10.0.1

	# Bump the minor version and release
	> npm run release -- minor

# npm dist-tag ls
# latest: 10.1.0

	# Bump the major version and release
	> npm run release -- major

# npm dist-tag ls
# latest: 11.0.0
#
	# Bump the minor version and pre-release
	> npm run prelease -- minor --preRelease=beta

# npm dist-tag ls
# latest: 11.0.0
# next: 11.1.0-beta.0

	# Bump the major version and pre-release
	> npm run prelease -- major --preRelease=beta

# npm dist-tag ls
# latest: 11.0.0
# next: 12.0.0-beta.0

	# Bump the major version and pre-release
	> npm run prelease -- --preRelease=rc

# npm dist-tag ls
# latest: 11.0.0
# next: 12.0.0-rc.0
```

Any of these commands will essentially do the following steps:

- `npm version ${increment || 'patch'}` # Bump the version and create a git tag
- `grunt dist` # Generate distributable files
- `npm run deploy-s3` # Deploy those files to S3 (no overwrites!)
- `git push` # Push the newly created commit and tag to GitHub
- Release to GitHub _(could be pre-release)_ # Mark the tag as a GitHub Release
- `npm publish` _(tag is latest or next)_ # Push the package to registry.npmjs.org

Make sure to not do this on the `master` branch because it is protected from being pushed to directly and your code will get released to S3 but not to git/GitHub/npm.

## Updating the docs

We serve the docs site from the `gh-pages` branch and all generated files are present in the `.gitignore` of the `master`-style branches. The `gh-pages` branch only contains these generated files, one folder for each major version since we introduced versioning to the docs (`v10`).

Make sure you have the following environment variables set:

```sh
export GH_USER_NAME=[Your GitHub username]
export GH_ACCESS_TOK=[Your GitHub personal access token]
```

Run `npm run gh-pages`, which will do the following:

- `grunt dist` # Generate distributable files
- `cd tasks` # This is actually the CWD of the gh-pages script
- `git clone ${GH_USER_NAME}:${GH_ACCESS_TOK}@github:Tradeshift/tradeshift-ui -b gh-pages --single-branch` # Clone the gh-pages branch to a new folder
- Create a `v${majorVersion}` folder and/or replace its contents
- Push the changes to `origin/gh-pages-update`

From here, you should create a PR against `gh-pages` to update the docs site and once it's merged, GitHub Pages will update.

## Running tests

Make sure you have a BrowserStack Automate account and have the following environment variables set:

```sh
export BROWSERSTACK_USERNAME=[Your BrowserStack username]
export BROWSERSTACK_KEY=[Your BrowserStack key]
```

Then feel free to start running the tests as such:

`npm test`

This command will run all the Jasmine tests for all UI Components through BrowserStack.

We're currently testing on the following browsers:

- Google Chrome (latest, previous)
- Mozilla Firefox (latest, previous)
- Apple Safari (latest, previous)
- Microsoft Edge (latest, previous)
- IE11

## Contribute

If you would like to contribute to our codebase, just fork the repo and make a PR.

## License

- You can always create forks on GitHub, submit Issues and Pull Requests.
- You can only use Tradeshift-UI to make apps on a Tradeshift platform, e.g. tradeshift.com.
- You can fix a bug until the bugfix is deployed by Tradeshift.
- You can host Tradeshift UI yourself.
- If you want to make a bigger change or just want to talk with us, reach out to our team here on GitHub.

You can read the full license agreement in the [LICENSE.md](https://github.com/Tradeshift/tradeshift-ui/blob/master/LICENSE.md).
