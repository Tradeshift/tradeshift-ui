Tradeshift UI
==============

This project builds `ts.js` which is more or less what we expect third party developers to include. We also expect to include it ourself, so that we share a technical foundation with these guys. For now, we compile the kitchen sink with each new build, but this will become more modularized as third party developers step up. To set it up, install [Node.js](http://nodejs.org/download/) and [Grunt](http://gruntjs.com/getting-started), then run:

	npm install

##Documentation
For demo / reference documentation  [click here](http://tradeshift.github.io/tradeshift-ui/)

##Deploy to CDN
If you make changes, you should transmit a new build to the CDN. Command `grunt build` will ship the files to the production folder on CloudFront while `grunt build-dev` will ship them for use in a development scenario. For now, please stick to the last one. Note the the version number must be bumped in `package.json` by running the `grunt release` command.

##Local development
Before you deploy to CDN, you may like to check your changes locally. To do so, simply run `grunt`. This will build `ts.js` and serve it up on [localhost:10111/dist/ts.min.js](http://localhost:10111/dist/ts.js).

## Setup

First you'll have to set up a few things. No worries, it shouldn't take long.

1. Clone the repo locally.
1. Install [ChromeDriver](https://code.google.com/p/chromedriver/downloads/list)
  - Easiest way to install is with homebrew. Highly suggested.
1. Install Node.js v4.5.0. This is the current standard Node version in Tradeshift.
	- http://nodejs.org/download/
1. Install the Grunt Command Line Utility globally
	- `npm install -g grunt-cli`
1. Install this repo's dependencies
  - `npm install` inside of this repository

## Running tests
### Unit Tests

```
grunt test
```

### Integration Tests

```
grunt integration-test
```
