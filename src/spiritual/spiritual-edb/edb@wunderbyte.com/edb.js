/*
 * Namepace object.
 * @using {gui.Arguments.confirmed}
 */
window.edb = gui.namespace(
	'edb',
	(function using(confirmed) {
		return {
			/**
			 * Current version (injected during build process).
			 * @see https://www.npmjs.org/package/grunt-spiritual-build
			 * @type {string} (majorversion.minorversion.patchversion)
			 */
			version: '<%= version %>',

			/**
			 * Logging some debug messages? This can be flipped via meta tag:
			 * `<meta name="edb.debug" content="true"/>`
			 * @type {boolean}
			 */
			debug: false,

			/**
			 * While true, any inspection of an {edb.Objects} or {edb.Arrays}
			 * will be be followed by a synchronous broadcast message (below).
			 * @type {object}
			 */
			$accessaware: false,

			/**
			 * Broadcasts.
			 */
			BROADCAST_ACCESS: 'edb-broadcast-access',
			BROADCAST_CHANGE: 'edb-broadcast-change',
			BROADCAST_OUTPUT: 'edb-broadcast-output',
			BROADCAST_SCRIPT_INVOKE: 'edb-broadcast-script-invoke',

			/**
			 * Ticks.
			 */
			TICK_SCRIPT_UPDATE: 'edb-tick-script-update',
			TICK_COLLECT_INPUT: 'edb-tick-collect-input',
			TICK_PUBLISH_CHANGES: 'edb-tick-update-changes',

			/**
			 * @deprecated
			 */
			get: function() {
				console.error('Deprecated API is deprecated: edb.get()');
			}
		};
	})(gui.Arguments.confirmed)
);

/**
 * Toggle this to force the next model change to notify observers
 * synchronously. The flag will automatically toggle back to false.
 *
 (function setup(critical) {
 Object.defineProperty(edb, '$criticalchange', {
 get: function() {
 return critical;
 },
 set: function(value) {
 if((critical = value)) {
 gui.Tick.next(function() {
 critical = false;
 });
 }
 }
 });
 }(false));
 */
