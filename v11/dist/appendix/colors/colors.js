/**
 * The "colors.less" file can just be copy-pasted from the LESS file.
 * We will parse this file into a JSON array that can be rendered.
 */
ts.ui.ready(function rendercolors() {
	var colors = {};
	var rules = document.getElementById('doc-colors').sheet.cssRules;
	for (var i = 0; i < rules.length; i++) {
		var rule = rules[i];
		var color = rule.selectorText.substring(5);
		var rgb = rule.style.color;
		var channels = rgb.match(/rgb\((\d{1,3}), (\d{1,3}), (\d{1,3})\)/);
		var row = color.split('-')[1];
		colors[row] = colors[row] || {};
		var hsl = rgbToHsl(channels[1], channels[2], channels[3]);
		colors[row]['@' + color] = {
			rgb: rule.style.color,
			hsl: hsl[0],
			hex: rgbToHex(rgb),
			darkClass: hsl[3] < 35 ? 'doc-dark' : 'doc-light'
		};
	}
	colors.black = Object.assign({}, colors.black, colors.white);
	delete colors.white;
	colors.green = Object.assign({}, colors.green, colors.litegreen, colors.darkgreen);
	delete colors.litegreen;
	delete colors.darkgreen;
	colors.darkblue = Object.assign({}, colors.darkblue, colors.dustblue, colors.liteblue);
	delete colors.dustblue;
	delete colors.liteblue;
	ts.ui.get('#doc-colors-demo', function(spirit) {
		spirit.script.run(Object.values(colors));
	});
});

// @see http://rgb2hsl.nichabi.com/javascript-function.php
function rgbToHsl(r, g, b) {
	var max, min, h, s, l, d;
	r /= 255;
	g /= 255;
	b /= 255;
	max = Math.max(r, g, b);
	min = Math.min(r, g, b);
	l = (max + min) / 2;
	if (max === min) {
		h = s = 0;
	} else {
		d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		switch (max) {
			case r:
				h = (g - b) / d + (g < b ? 6 : 0);
				break;
			case g:
				h = (b - r) / d + 2;
				break;
			case b:
				h = (r - g) / d + 4;
				break;
		}
		h /= 6;
	}
	h = Math.floor(h * 360);
	s = Math.floor(s * 100);
	l = Math.floor(l * 100);

	return ['hsl(' + h + ', ' + s + ', ' + l + ')', h, s, l];
}

// @see https://gist.github.com/sabman/1018593
function rgbToHex(rgb) {
	rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
	function hex(x) {
		return ('0' + parseInt(x).toString(16)).slice(-2);
	}
	return '#' + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}
