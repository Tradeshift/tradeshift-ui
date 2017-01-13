var http = require('http');
var url = require('url');

/**
 * Checks CDN for existing resources (and fails if they do exist)
 * TODO (jmo@): http://stackoverflow.com/questions/16965582/node-js-http-get-hangs-after-5-requests-to-remote-site
 */
module.exports = {
	init: function(grunt) {
		grunt.registerMultiTask('check_cdn', 'Check if file already exists on CDN', function() {
			var done = this.async();
			var options = this.data;
			function checkNext() {
				if (options.urls.length < 1) {
					done(true);
					return;
				}
				var cdnUrl = options.urls.pop();
				var reqOpts = url.parse(cdnUrl);
				reqOpts.method = 'HEAD';
				var req = http.request(reqOpts, function(res) {
					if (res.statusCode < 399) {
						grunt.fatal('File already exists: ' + cdnUrl);
						done(false);
						return;
					}
					grunt.log.writeln(('CDN resource not found:' + cdnUrl).green);
					checkNext();
				});
				req.end();
			}
			checkNext();
		});
	}
};
