/**
 * The "colors.txt" file can just be copy-pasted from the LESS file.
 * We will parse this file into a JSON array that can be rendered.
 */
ts.ui.ready(function rendercolors() {});

/*
 * TODO: Also display RGB and HEX codes!
 *
function hslToRgb(h, s, l) {
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
	return [
		Math.max(0, Math.min(Math.round(r * 255), 255)),
		Math.max(0, Math.min(Math.round(g * 255), 255)),
		Math.max(0, Math.min(Math.round(b * 255), 255))
	];
}

function hue2rgb(p, q, t) {
	if (t < 0) t += 1;
	if (t > 1) t -= 1;
	if (t < 1 / 6) return p + (q - p) * 6 * t;
	if (t < 1 / 2) return q;
	if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
	return p;
}
*/
