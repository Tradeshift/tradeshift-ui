/**
 * For local development, remove references to
 * 127.0.0.1 to support mobile device testing.
 */
module.exports = {
	/**
	 * Replace 127.0.0.1 with network IP.
	 * @param {string} text
	 * @returns {string}
	 */
	publish: function(text) {
		var localhost = '127.0.0.1';
		var publichost = getip();
		while (text.indexOf(localhost) > -1) {
			text = text.replace(localhost, publichost);
		}
		return text;
	}
};

/**
 * Dig up our network IP.
 * @returns {string}
 */
function getip() {
	var result = null;
	var ifaces = require('os').networkInterfaces();
	Object.keys(ifaces).forEach(function(dev) {
		ifaces[dev].every(function(details) {
			if (details.family === 'IPv4') {
				result = details.address;
			}
			return !result;
		});
	});
	if (result === '127.0.0.1') {
		result = 'localhost'; // otherwise not work offline (?)
	}
	return result;
}
