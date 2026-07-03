/**
 * Patch the `browserstack` API client (a browserstack-runner dependency).
 *
 * browserstack/lib/client.js crashes the process on malformed API responses,
 * turning transient BrowserStack hiccups into hard build failures:
 *
 * 1. Non-200 response with no content-type header: `res.headers["content-type"]`
 *    is undefined, so `.indexOf` throws. Happens during worker teardown, AFTER
 *    tests have passed — turning a green run red.
 * 2. JSON content-type but an HTML body (API error / maintenance page):
 *    `JSON.parse` throws, in both the 200 and non-200 branches.
 *
 * We null-guard the header and wrap both JSON.parse calls so a bad response
 * becomes a normal error callback (which the runner tolerates) instead of
 * killing the process. Runs on postinstall to survive fresh `npm ci` in CI.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const clientPath = path.join(__dirname, '../node_modules/browserstack/lib/client.js');

const PATCHES = [
	{
		name: 'null-guard content-type header',
		original: 'if ( res.headers[ "content-type" ].indexOf( "json" ) !== -1 ) {',
		patched:
			'if ( res.headers[ "content-type" ] && res.headers[ "content-type" ].indexOf( "json" ) !== -1 ) {'
	},
	{
		name: 'tolerate non-JSON body on error responses',
		original: 'response = JSON.parse( response );',
		patched:
			'try { response = JSON.parse( response ); } catch ( e ) { response = { message: response }; }'
	},
	{
		name: 'tolerate non-JSON body on success responses',
		original: 'fn( null, JSON.parse( response ) );',
		patched:
			'var parsed; try { parsed = JSON.parse( response ); } catch ( e ) { return fn( new Error( "BrowserStack API returned non-JSON response: " + String( response ).slice( 0, 200 ) ) ); } fn( null, parsed );'
	}
];

if (!fs.existsSync(clientPath)) {
	console.log('[patch-browserstack-client] browserstack/client.js not found, skipping.');
} else {
	let src = fs.readFileSync(clientPath, 'utf8');
	PATCHES.forEach(function(patch) {
		if (src.includes(patch.patched)) {
			console.log('[patch-browserstack-client] already patched: ' + patch.name);
		} else if (src.includes(patch.original)) {
			src = src.replace(patch.original, patch.patched);
			console.log('[patch-browserstack-client] patched: ' + patch.name);
		} else {
			console.log(
				'[patch-browserstack-client] expected code not found for "' +
					patch.name +
					'" — browserstack version may have changed. Re-check the patch against ' +
					'node_modules/browserstack/lib/client.js.'
			);
		}
	});
	fs.writeFileSync(clientPath, src, 'utf8');
}
