var BrowserStackTunnel = require('browserstacktunnel-wrapper');

var tunnel = null;

module.exports = {
	start: function(options, done) {
		tunnel = new BrowserStackTunnel(options);
		tunnel.start(function(error) {
			if (error) {
				console.log(error);
				done(error);
			} else {
				console.log('Tunnel up');
				done();
			}
		});
	},
	stop: function(done) {
		tunnel.stop(function(error) {
			if (error) {
				console.log(error);
				done(error);
			} else {
				console.log('Tunnel down');
				done();
			}
			tunnel = null;
		});
	}
};
