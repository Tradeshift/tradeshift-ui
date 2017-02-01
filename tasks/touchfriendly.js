var cssp = require('css-parse');

/**
 * Supress CSS :hover states on mobile devices. The class 
 * 'ts-device-mouse' gets added over on the clientside.
 */
module.exports = {
	init: function(grunt) {
		grunt.registerMultiTask('touchfriendly', 'Touch optimize CSS', function() {
			var files = this.data.files;
			Object.keys(files).forEach(function(target) {
				var input = grunt.file.read(files[target]);
				var sheet = cssp(input).stylesheet;
				var hacks = [];
				sheet.rules.forEach(function(rule) {
					if (rule.selectors) {
						rule.selectors.forEach(function(s) {
							if (s.contains(':hover')) {
								hacks.push(s);
							}
						});
					}
				});
				target = grunt.template.process(target);
				grunt.log.writeln('Created 1 file');
				grunt.file.write(target, hacks.reduce(function(output, selector) {
					var mouse = '.ts-device-mouse', selec = mouse + ' ' + selector;
					['.ts-mobile', '.ts-tablet', '.ts-desktop'].forEach(function(fix) {
						selec = selec.replace(mouse + ' ' + fix, mouse + fix);
					});
					return output.replace(selector, selec);
				}, input));
			});
		});
	}
};