[![Gitter](https://img.shields.io/badge/gitter-join%20chat-f81a65.svg?style=flat-square)](https://gitter.im/tradeshift-ui/Lobby)
[![travis.org Build Status](https://travis-ci.org/Tradeshift/tradeshift-ui.svg?branch=master)](https://travis-ci.org/Tradeshift/tradeshift-ui)
[![devDependencies](https://img.shields.io/david/dev/Tradeshift/tradeshift-ui.svg?style=flat-square)](https://david-dm.org/Tradeshift/tradeshift-ui/?type=dev)
___

# [Tradeshift UI](http://ui.tradeshift.com)

Tradeshift UI is a UI library to help you create apps that implement the [Tradeshift Design Principles](http://ui.tradeshift.com/#design/).
Check out our [documentation site](http://ui.tradeshift.com) to learn more about how it works and try out live code examples.

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

Watch out, whenever you create a commit, the pre-commit hook will generate the documentation files, so the committed version works with GitHub pages.

## Documentation

If you want to browse our [documentation site](http://ui.tradeshift.com) you can do so easily.

## Release & Deployment

Make sure you have the following environment variables set:
```
export AWS_ACCESS_KEY_ID=[Your AWS Access Key ID]
export AWS_SECRET_ACCESS_KEY=[Your AWS Secret Access Key]
```

If you have the correct AWS access keys to release a new version of tradeshift-ui, you can do so using the `grunt release` command.
It will bump the version inside `package.json`, commit, tag release, upload to CloudFront and push to GitHub. Make sure to not do this on the `master` branch because it is protected from being pushed to directly.

## Running tests

Make sure you have a BrowserStack Automate account and have the following environment variables set:
```
export BROWSERSTACK_USERNAME=[Your BrowserStack username]
export BROWSERSTACK_KEY=[Your BrowserStack key]
```

Then feel free to start running the tests as such:

`npm test`

This command will run all the Jasmine tests for all UI Components through BrowserStack.

We're currently testing on the following browsers:
* Google Chrome (latest, previous)
* Mozilla Firefox (latest, previous)
* Apple Safari (latest, previous)
* IE9, IE10, IE11

## Roadmap
To stay up to date with upcoming releases and new features in the works, check out our [ROADMAP.md](https://github.com/Tradeshift/tradeshift-ui/blob/master/ROADMAP.md).

## Contribute

If you would like to contribute to our codebase, just fork the repo and make a PR or just write to us on [Gitter](https://gitter.im/tradeshift-ui/Lobby), we're always looking for more input =)

## License

* You can always create forks on GitHub, submit Issues and Pull Requests.
* You can only use Tradeshift-UI to make apps on a Tradeshift platform, e.g. tradeshift.com.
* You can fix a bug until the bugfix is deployed by Tradeshift.
* You can host Tradeshift UI yourself.
* If you want to make a bigger change or just want to talk with us, reach out to our team here on GitHub.

You can read the actual license agreement in the [LICENSE.md](https://github.com/Tradeshift/tradeshift-ui/blob/master/LICENSE.md).
