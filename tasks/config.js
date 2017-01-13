var fs = require('fs');
var path = require('path');
var xtend = require('node.extend');
var alce = require('alce');

var ROOT = path.join(__dirname, '..');
/**
 * Ad hoc config reader. Allow comments in jSON, if we would like that.
 * @see https://github.com/walmartlabs/ALCE
 */
module.exports = {
	init: function() {
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
			config1 = xtend(
				config1,
				read(config2)
			);
		}
		return config1;
	}
};

/**
 * @param {string} file
 * @returns {string}
 */
function read(file) {
	return alce.parse(
		fs.readFileSync(path.join(ROOT, file)),
		{meta: false}
	);
}

/**
 * @param {string} file
 * @returns {boolean}
 */
function exists(file) {
	return fs.existsSync(path.join(ROOT, file));
}
