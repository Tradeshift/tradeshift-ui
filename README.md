[![Build Status](https://travis-ci.com/Tradeshift/tradeshift-ui.svg?token=RshDHtS73Tukd2xSZzeg&branch=master)](https://travis-ci.com/Tradeshift/tradeshift-ui)
[![Gitter](https://img.shields.io/badge/gitter-join%20chat-f81a65.svg?style=flat-square)](https://gitter.im/Tradeshift/tradeshift-ui)
[![PeerDependencies](https://img.shields.io/david/peer/Tradeshift/tradeshift-ui.svg?style=flat-square)](https://david-dm.org/Tradeshift/tradeshift-ui#info=peerDependencies&view=list)
[![Dependencies](https://img.shields.io/david/Tradeshift/tradeshift-ui.svg?style=flat-square)](https://david-dm.org/Tradeshift/tradeshift-ui)
[![DevDependencies](https://img.shields.io/david/dev/Tradeshift/tradeshift-ui.svg?style=flat-square)](https://david-dm.org/Tradeshift/tradeshift-ui#info=devDependencies&view=list)

# [Tradeshift UI](https://ui.tradeshift.com)

Tradeshift UI is a UI library to help you create apps that implement the [Tradeshift Design Principles](https://ui-dev.tradeshift.com/#design/).
Check out our [documentation site](https://ui-dev.tradeshift.com) to learn more about how it works and try out live code examples.

If you want to know about what the latest version is and what's new, check out our [releases page](https://github.com/Tradeshift/tradeshift-ui/releases).

If you'd like to submit a feature request or report a bug, go to our [issues pages](https://github.com/Tradeshift/tradeshift-ui/issues).

## Installation

1. Clone this repository
1. Install [ChromeDriver](https://code.google.com/p/chromedriver/downloads/list)
  - If you're on a Mac, the easiest way to install is with `homebrew`. Highly suggested.
1. Install [NodeJS](https://nodejs.org/), either LTS or current.
1. Install the Grunt Command Line Utility globally.
	- `npm install -g grunt-cli`
1. Install the dependencies of this project.
	- `npm install`

### Optional steps to set up the documentation site locally

1. Install the dependencies inside the `docs/` folder.
	- `cd docs; npm install`

## Usage (Local Development)

1. Start the `grunt` script in the root of the repository.
	- `grunt`
1. Use [`http://localhost:10111/dist/ts.js`](`http://localhost:10111/dist/ts.js`) in your app running locally to initialize Tradeshift UI.
1. Whenever you modify the source files, the script will rebuild the distribution files in `dist/` so you're always using the latest version.

### Optional steps to run the documentation site locally

1. Start the `grunt` script in the `docs/` folder.
	- `cd docs; grunt`
1. Navigate to [`http://localhost:10114/`](http://localhost:10114/) to view the documentation site locally.
1. Whenever you modify the source files, the script will rebuild the distribution files in `dist/` so you're always using the latest version.

## Git Hooks

Watch out, whenever you create a commit, the pre-commit hook will generate the documentation files, so the committed version works with GitHub pages.

## Documentation

If you want to browse our [documentation site](https://ui-dev.tradeshift.com) you can do so easily.

## Releasing

If you have the correct AWS access keys to release a new version of tradeshift-ui, you can do so using the `grunt release` command.
It will bump the version inside `package.json`, commit, tag release, upload to CloudFront and push to GitHub. Make sure to not do this on the `master` branch because it is protected from being pushed to directly.

## Running tests

`grunt test`

This command will run all the Karma tests for all UI Components in the locally available Firefox and Chrome installations.

## Roadmap

To stay up to date with upcoming releases and new features in the works, check out our [ROADMAP.md](https://github.com/Tradeshift/tradeshift-ui/blob/master/ROADMAP.md).

## Contribute

If you would like to contribute to our codebase, just fork the repo and make a PR or just write to us on [Gitter]((https://gitter.im/Tradeshift/tradeshift-ui)), we're always looking for more input =)

## License

Despite this repository being public and freely accessible to anyone, we reserve all rights, as stated in the [LICENSE.md](https://github.com/Tradeshift/tradeshift-ui/blob/master/LICENSE.md)
