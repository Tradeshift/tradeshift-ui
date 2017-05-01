const glob = require('glob');
const fs = require('fs');

glob.sync('src/**/*.js').forEach(file => {
	const code = fs.readFileSync(file, 'UTF-8');
	const fixt = fix(code);
	if (fixt.trim() !== code.trim()) {
		fs.writeFileSync(file, fixt);
	}
});

/**
 * Fix the comment issue.
 * @param {string} code
 * @returns {string}
 */
function fix(code) {
	const lines = code.split('\n');
	let comment = false;
	let indents = '';
	return lines
		.map(line => {
			const trim = line.trim();
			if (comment) {
				line = indents + ' ' + trim;
				if (trim.startsWith('*/')) {
					comment = false;
					indents = '';
				}
			} else if (trim.startsWith('/**')) {
				comment = true;
				indents = line.split('/**')[0];
			}
			return line;
		})
		.join('\n');
}
