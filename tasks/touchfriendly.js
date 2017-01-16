var cssp = require('css-parse');

/**
 * Supress CSS :hover states on mobile devices. The class 'ts-device-mouse'
 * gets added on the clientside. This thing is coppy-pasted from Runtime!
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

/*
 * TODO: we have a bug somewhere :/
 *
var primarycase = '.ts-device-mouse';
var cornercases = ['.ts-mobile', '.ts-tablet', '.ts-desktop']; // TODO: more cornercases :/
grunt.file.write(target,
	input.split('\n').map(function(line) {
		hacks.every(function(selector) {
			if(line.startsWith(selector)) {
				line = '.ts-device-mouse ' + selector;
				cornercases.forEach(function(cornercase) {
					line = line.replace(
						primarycase + ' ' + cornercase,
						primarycase + cornercase
					);
				});
				return false;
			}
			return true;
		});
		return line;
	}).join('\n')
);
*/
