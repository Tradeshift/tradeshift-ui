/**
 * Patch the `browserstack` API client (a dependency of browserstack-runner).
 *
 * browserstack/lib/client.js crashes the whole process on malformed API
 * responses, turning transient BrowserStack hiccups into hard build failures:
 *
 * 1. A non-200 response without a content-type header:
 *        if ( res.headers[ "content-type" ].indexOf( "json" ) !== -1 ) {
 *    `res.headers["content-type"]` is undefined, so `.indexOf` throws. This
 *    happens during worker teardown (terminateWorker), AFTER tests have
 *    already passed — turning a green run red.
 *
 * 2. A response with a JSON content-type but an HTML body (API error or
 *    maintenance pages): `JSON.parse(response)` throws "Unexpected token <
 *    in JSON at position 0" — in both the non-200 and the 200 branch.
 *
 * We null-guard the header and wrap both JSON.parse call sites so a bad
 * response surfaces as a normal error callback (which the runner logs and
 * tolerates) instead of killing the process. Runs on postinstall so it
 * survives fresh `npm ci` installs in CI.
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
