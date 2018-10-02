#!/usr/bin/env node

/**
 * Generate the minimum viable package.json for an npm package
 */

const prettier = require('prettier');
const fs = require('fs');
const path = require('path');
const packageJson = require('../package.json');

delete packageJson.scripts;
delete packageJson.devDependencies;
delete packageJson.browserslist;
delete packageJson['lint-staged'];
packageJson.main = 'ts.js';

try {
	write('../dist/npm/package.json', packageJson);
} catch (e) {
	process.exit(1);
}
process.exit(0);

function write(file, json) {
	fs.writeFileSync(
		path.join(path.dirname(fs.realpathSync(__filename)), file),
		pretty(json),
		'utf-8'
	);
}

function pretty(json) {
	return prettier.format(`${JSON.stringify(json, null, '\t')}\n`, {
		parser: 'json',
		useTabs: true,
		printWidth: 100
	});
}
