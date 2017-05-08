/**
 * Spirit of the image. Note that all this fallback image functionality should
 * probably be moved serverside (on an open accesss point) at some point.
 * TODO: Read https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/btoa#Unicode_Strings
 * @using {string} css (this is the Base64 encoded "'Open Sans" in weight 400)
 */
ts.ui.ImageSpirit = (function using(fontcss) {
	/**
	 * Generate URL from Blob stylesheet. The stylesheet
	 * contains the font so that we can use that in SVG.
	 * It turns out that Chrome doesn't do `@import` in
	 * SVG files, so we should probably convert this to
	 * something that works more optimized.
	 * @type {string}
	 */
	var fontsheet = (function generatesheet() {
		return gui.Client.hasBlob
			? URL.createObjectURL(new Blob([fontcss], { type: 'text/css' }))
			: null;
	})();

	/**
	 * With our current setup, only Firefox can handle the font in
	 * a really optimized way because Chrome can't use `@import` in
	 * SVG files. If that becomes a problem, we must fix it. But
	 * the fast workaround is to return `null` which will then
	 * fallback the font to Arial in that browser. Note that this
	 * should only be a problem if there are hundreds of generated
	 * images being rendered at the exact same time.
	 * @param {string} agent
	 * @returns string;
	 */
	function getfontsheet(agent) {
		switch (agent) {
			case 'gecko':
			case 'webkit':
				return fontsheet;
			default:
				return null;
		}
	}

	/**
	 * Get computed image source (caching this to optimize repeated requests).
	 * TODO: Use Blob URL instead of base64 in browsers that support it.
	 * @param {string}
	 * @param @optional {number} width
	 * @param @optional {number} height
	 */
	var getsource = gui.Combo.memoized(function(name, width, height) {
		return (
			'data:image/svg+xml;base64,' +
			window.btoa(
				ts.ui.svgname.edbml(
					getinitials(name),
					getcolorval(name, 50),
					getcolorval(name, -180),
					width || height || ts.ui.UNIT_DOUBLE,
					getfontsheet(gui.Client.agent),
					fontcss
				)
			)
		);
	});

	/**
	 * Get initials for name.
	 * If the name is Karl Benson(Ka), It will return KA
	 * @param {string} name
	 * @returns {string}
	 */
	function getinitials(name) {
		var regExp = /\(([^)]+)\)/;
		if (regExp.test(name)) {
			return regExp.exec(name)[1].toUpperCase();
		}
		var names = name.split(/\s+/);
		var first = names.shift();
		var last = names.pop() || '';
		return (first[0] + (last[0] || '')).toUpperCase();
	}

	/**
	 * Compute consistantly pleasent color for given string.
	 * @param {string} str
	 * @param @optional {number} mod Darken or ligthen mod
	 */
	function getcolorval(name, mod) {
		var base = [245, 245, 245]; // TODO: optimize for diff backgrounds
		var r = base[0];
		var g = base[1];
		var b = base[2];
		var red = color(name, 3);
		var green = color(name, 5);
		var blue = color(name, 7);
		red = (red + r) / 2;
		green = (green + g) / 2;
		blue = (blue + b) / 2;
		var col = [red, green, blue].map(Math.floor);
		return 'rgb(' + darken(col, mod || 0).join(',') + ')';
	}

	/**
	 * Obscurely darken or lighten a color.
	 * https://gist.github.com/p01/1005192
	 */
	function darken(c, n) {
		return c.map(function(d) {
			return (d += n) < 0 ? 0 : d > 255 ? 255 : d | 0;
		});
	}

	/**
	 * Get integer hashcode.
	 * @param {string} word
	 * @param {number} n
	 * @returns {number}
	 */
	function hash(word, n) {
		var h = 0;
		for (var i = 0; i < word.length; i++) {
			h = word.charCodeAt(i) + ((h << n) - h);
		}
		return Math.abs(h);
	}

	/**
	 * Get computed color value.
	 * @param {string} word
	 * @param {number} n
	 * @returns {number}
	 */
	function color(word, n) {
		return Math.floor(parseFloat('0.' + hash(word, n)) * 256);
	}

	return ts.ui.Spirit.extend(
		{
			/**
			 * Setup load handler (dependant on cache status).
			 */
			onconfigure: function() {
				this.super.onconfigure();
				var src = this.att.get('src');
				var alt = this.att.get('alt');
				var tit = this.att.get('title');
				if (src) {
					if (this.element.naturalWidth) {
						this._onload();
					} else {
						this.event.add('load').add('error');
					}
					if (alt && !tit) {
						this.att.set('title', alt);
					}
				} else {
					this.event.add('load');
					this.att.add('alt');
				}
			},

			/**
			 * Handle event.
			 * @param {Event} e
			 */
			onevent: function(e) {
				this.super.onevent(e);
				switch (e.type) {
					case 'load':
						this.event.remove('load');
						this._onload();
						break;
					case 'error':
						this.event.remove('error');
						this.att.add('alt');
						break;
				}
			},

			/**
			 * The ALT attribute will be used to generate a fallback
			 * image: We generate an SVG which we then Base64 encode.
			 * @param {gui.Att} att
			 */
			onatt: function(att) {
				this.super.onatt(att);
				if (att.name === 'alt') {
					if (!att.value.includes('{')) {
						// no weird handlebars syntax
						if (!this.att.has('title')) {
							this.att.set('title', att.value);
						}
						if (window.btoa) {
							this.element.src = this._computesource(att.value);
						} else {
							// We'll need to polyfill some Base64 stuff for Exploder :/
							console.warn('TODO: Image fallback for IE9');
						}
					}
				}
			},

			// Private .................................................................

			/**
			 * We've set the `opacity` to `0` while loading the image just
			 * in case the browser flashes some kind of strange symbol. But
			 * this is perhaps not needed nowadays, must check slow connection.
			 */
			_onload: function() {
				this.css.add('ts-loaded');
				this.action.dispatch(ts.ui.ACTION_DID_LOAD);
			},

			/**
			 * Compute fallback image source. Note that we don't read `offsetWidth`
			 * because that will force the browser the repaint mid-rendering, we'll
			 * suggest that the `width` attribute is specified (for best quality).
			 * @param {string} name
			 * @returns {string}
			 */
			_computesource: function(name) {
				var w = this.att.get('width');
				var h = this.att.get('height');
				if ((w || h) && w !== h) {
					console.error('Height of the ' + this + ' must match the width');
				}
				return getsource(name, w, h);
			}
		},
		{
			// Static ...............................................................

			/**
			 * Compute consistantly pleasent color for given string.
			 * Exposing this in case the color needs to be replicated.
			 * @param {string} str
			 * @returns {string}
			 */
			getColorForString: function(str) {
				return getcolorval(str);
			}
		}
	);
})(
	[
		'@font-face {',
		'	font-family: "Open Sans";',
		' font-style: normal;',
		' font-weight: 300;',
		"	src: url(data:font/woff;charset=utf-8;base64,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) format('woff');",
		'}'
	].join('\n')
);
