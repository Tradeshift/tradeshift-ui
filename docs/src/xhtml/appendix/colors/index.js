/**
 * The "colors.txt" file can just be copy-pasted from the LESS file.
 * We will parse this file into a JSON array that can be rendered.
 */
ts.ui.ready(function rendercolors() {
	function serious(part) {
		return part.includes('@') && part.includes(':');
	}

	function defs(part) {
		var cut = part.split(':');
		var def = cut[0].trim();
		var val = cut[1].trim();
		return `\t\t` + quote(def.slice(def.indexOf('@'))) + ': ' + quote(val);
	}

	function object(txt) {
		return '\t{\n' + txt + '\n\t}';
	}

	function array(txt) {
		return '[\n' + txt + '\n]';
	}

	function quote(txt) {
		return '"' + txt + '"';
	}

	function parseone(css) {
		return css
			.split(';')
			.filter(serious)
			.map(defs)
			.join(',\n');
	}

	function parseall(css) {
		return css
			.split('//')
			.filter(serious)
			.map(function(section) {
				return object(parseone(section));
			})
			.join(',\n');
	}

	$.get('colors.txt', function(css) {
		ts.ui.get('#doc-colors-demo', function(spirit) {
			spirit.script.run(JSON.parse(array(parseall(css))));
		});
	});
});
