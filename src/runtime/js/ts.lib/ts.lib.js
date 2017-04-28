/**
 * Namespace object.
 */
ts.lib = ts.lib || {
	/**
	 * TODO (jmo@): run this file through grunt.template.process()
	 * @type {string}
	 */
	version: '<%= version %>',

	/**
	 * Identification.
	 * @return {String}
	 */
	toString: function() {
		return '[namespace ts.lib]';
	}
};
