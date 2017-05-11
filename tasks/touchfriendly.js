const postcss = require('postcss');

/**
 * Supress CSS :hover states on mobile devices. The class
 * 'ts-device-mouse' gets added over on the clientside.
 */
const touchfriendly = postcss.plugin('postcss-ts-touch-friendly', (options = {}) => {
	return root => {
		let numSelectors = 0;
		let numModifiedSelectors = 0;
		let numRules = 0;
		root.walkRules(decl => {
			++numRules;
			let newSelectors = [];
			decl.selector.split(',').forEach(selector => {
				++numSelectors;
				if (selector.indexOf(':hover') !== -1) {
					++numModifiedSelectors;
					newSelectors.push(`.ts-device-mouse ${selector}`);
				} else {
					newSelectors.push(selector);
				}
			});
			decl.selector = newSelectors.join(',\n');
		});
		console.log(
			`Converted ${numModifiedSelectors} / ${numSelectors} selectors in ${numRules} rules.`
		);
	};
});

module.exports = touchfriendly;
