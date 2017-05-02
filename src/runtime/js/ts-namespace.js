/*
 * The file is called 'ts-namespace.js' because there's another `ts.js` in
 * the game, that's the Runtime bootloader in the root of the `src/runtime/js`.
 */
window.ts = window.ts || {
	// something called `ts` exists in Grails already...
	toString: function() {
		return '[namespace ts]';
	}
};
