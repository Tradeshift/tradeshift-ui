/**
 * Patch the `browserstack` API client (a dependency of browserstack-runner).
 *
 * browserstack/lib/client.js crashes the whole process when a non-200 API
 * response arrives without a content-type header:
 *
 *     if ( res.headers[ "content-type" ].indexOf( "json" ) !== -1 ) {
 *
 * `res.headers["content-type"]` is undefined on such responses, so `.indexOf`
 * throws. This happens during worker teardown (terminateWorker), AFTER tests
 * have already passed — turning a green run red. We null-guard the header so
 * the client falls through to using the raw response as the error message.
 *
 * This is the only browserstack crash not already prevented by
 * tasks/browserstack.browsers.js (which emits complete browser objects to
 * avoid the configParser/cli crash paths). Runs on postinstall so it survives
 * fresh `npm ci` installs in CI.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const clientPath = path.join(__dirname, '../node_modules/browserstack/lib/client.js');

const ORIGINAL = 'if ( res.headers[ "content-type" ].indexOf( "json" ) !== -1 ) {';
const PATCHED =
	'if ( res.headers[ "content-type" ] && res.headers[ "content-type" ].indexOf( "json" ) !== -1 ) {';

if (!fs.existsSync(clientPath)) {
	console.log('[patch-browserstack-client] browserstack/client.js not found, skipping.');
} else {
	const src = fs.readFileSync(clientPath, 'utf8');
	if (src.includes(PATCHED)) {
		console.log('[patch-browserstack-client] already patched, skipping.');
	} else if (!src.includes(ORIGINAL)) {
		console.log(
			'[patch-browserstack-client] expected code not found — browserstack version may have ' +
				'changed. Re-check the patch against node_modules/browserstack/lib/client.js.'
		);
	} else {
		fs.writeFileSync(clientPath, src.replace(ORIGINAL, PATCHED), 'utf8');
		console.log('[patch-browserstack-client] patched.');
	}
}
