var grunt = null;
var alce = require('alce');

/**
 * Ad hoc config reader. Allow comments in jSON, if we would like that.
 * @see https://github.com/walmartlabs/ALCE
 */
module.exports = {
	/**
	 * Init Grunt.
	 * @param {Grunt} g
	 */
	init: function(g) {
		grunt = g;
		return this;
	},

	/**
	 * Read config.
	 * @param {string} config1
	 * @returns {object}
	 */
	read: function(config) {
		return read(config);
	},

	/**
	 * Merge configs.
	 * @param {string} config1
	 * @param {string} config2
	 * @returns {object}
	 */
	merge: function(config1, config2) {
		config1 = read(config1);
		if (exists(config2)) {
			config1 = Object.assign(config1, config2);
		}
		return config1;
	}
};

/**
 * @param {string} file
 * @returns {string}
 */
function read(file) {
	return alce.parse(grunt.file.read(file), { meta: false });
}

/**
 * @param {string} file
 * @returns {boolean}
 */
function exists(file) {
	return grunt.file.exists(file);
}
