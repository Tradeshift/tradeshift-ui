/**
 * Spirit of the icon. Convert font icon to svg.
 * @extends {ts.ui.Spirit}
 */
ts.ui.IconSpirit = (function using() {
	var ICON_PREFIX = 'ts-icon-';
	var SVG_LINK = '//d5wfroyti11sa.cloudfront.net/prod/client/svg-icons/';
	var ICON_SUBSTITUTES = {
		todo: 'vote-flag-7',
		warning: 'interface-alert-triangle'
	};

	return ts.ui.Spirit.extend({
		/**
		 * Setup on enter.
		 */
		onenter: function() {
			this.super.onenter();
			this.att.add('class');
		},

		/**
		 * @param {gui.Att} att
		 */
		onatt: function(att) {
			this.super.onatt(att);
			if (att.name === 'class') {
				this._loadsvg();
			}
		},

		// Private ......................................................

		/**
		 * load svg by ajax
		 * XDomainRequest and CORS on IE9 http://perrymitchell.net/article/xdomainrequest-cors-ie9/
		 */
		_loadsvg: function() {
			var icon = this.$geticon();
			if (!icon) {
				return;
			}
			var ajax = null;
			var spirit = this;
			if (gui.Client.isExplorer9) {
				ajax = new window.XDomainRequest();
				ajax.open('get', SVG_LINK + encodeURIComponent(icon) + '.svg', true);
				setTimeout(function() {
					// why need to do like this https://developer.mozilla.org/en-US/docs/Web/API/XDomainRequest
					ajax.send();
				}, 0);
			} else {
				ajax = new XMLHttpRequest();
				ajax.open('get', SVG_LINK + encodeURIComponent(icon) + '.svg', true);
				ajax.send();
			}
			ajax.onload = function() {
				if (ajax.responseText) {
					spirit.element.innerHTML = ajax.responseText + '\n\n';
					console.log(icon + '\n' + ajax.responseText);
					gui.Tick.nextFrame(function() {
						spirit.$fixsize.apply(spirit);
					});
				}
			};
			ajax.onerror = function() {
				console.error('Can not get the svg ' + icon);
			};
		},

		/**
		 * Get icon
		 */
		$geticon: function() {
			var result = null;
			var klasses = this.element.className.split(' ');
			if (!klasses.length) {
				return result;
			}
			klasses.map(function(item) {
				if (item.indexOf(ICON_PREFIX) > -1) {
					result = item.substring(8, item.length);
				}
			});
			return this.$substitute(result);
		},

		$substitute: function(icon) {
			if (ICON_SUBSTITUTES[icon]) {
				return ICON_SUBSTITUTES[icon];
			}
			return icon;
		},

		$fixsize: function() {
			var fontSize = parseFloat(this.css.compute('fontSize'));
			var svgElem = this.element.querySelector('svg');
			svgElem.setAttribute('width', fontSize);
			svgElem.setAttribute('height', fontSize);
		}
	});
})();
