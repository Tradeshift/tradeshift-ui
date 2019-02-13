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
		var matches = val.match(/\d+/g);
		matches = matches.map(function(color) {
			return +color;
		});
		var rgb = hslToHex(matches[0], matches[1], matches[2]);
		return '\t\t' + quote(def.slice(def.indexOf('@'))) + ': ' + quote(rgb);
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

	function hslToHex(h, s, l) {
		h /= 360;
		s /= 100;
		l /= 100;
		var r, g, b;
		if (s === 0) {
			r = g = b = l; // achromatic
		} else {
			var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
			var p = 2 * l - q;
			r = hue2rgb(p, q, h + 1 / 3);
			g = hue2rgb(p, q, h);
			b = hue2rgb(p, q, h - 1 / 3);
		}
		return '#' + toHex(r) + toHex(g) + toHex(b);
	}

	function hue2rgb(p, q, t) {
		if (t < 0) t += 1;
		if (t > 1) t -= 1;
		if (t < 1 / 6) return p + (q - p) * 6 * t;
		if (t < 1 / 2) return q;
		if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
		return p;
	}

	function toHex(x) {
		var hex = Math.round(x * 255).toString(16);
		return hex.length === 1 ? '0' + hex : hex;
	}

	function copyColor() {
		var colorChips = document.querySelectorAll('.color-chip');

		colorChips.forEach(function(colorChip) {
			colorChip.addEventListener('click', function(e) {
				try {
					var input = document.createElement('input');
					input.id = 'copyInput';
					input.value = e.target.querySelector('.color-name').textContent;
					document.body.appendChild(input);

					var copyText = document.getElementById('copyInput');
					copyText.select();
					document.execCommand('copy');
					ts.ui.Notification.success('Color ' + copyText.value + ' copied to your clipboard.');
					document.body.removeChild(input);
				} catch (e) {}
			});
		});
	}

	$.get('colors.txt', function(css) {
		ts.ui.get('#doc-colors-demo', function(spirit) {
			spirit.script.run(JSON.parse(array(parseall(css))));
			copyColor();
		});
	});
});
