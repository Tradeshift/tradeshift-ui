/**
 * All sorts of layout relatedness.
 * @using {gui.Array} GuiArray
 * @using {gui.DOMPlugin} DOMPlugin
 * @using {gui.CSSPlugin} CSSPlugin
 * @using {gui.Combo#chained} chained
 */
ts.ui.LayoutPlugin = (function using(GuiArray, DOMPlugin, CSSPlugin, chained) {
	// TODO: this can be shortened now or what?
	var LEVELS = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9];

	return ts.ui.Plugin.extend(
		{
			/**
			 * Spirit is positioned before or after Main (not inside)?
			 * TODO(jmo@): could not use classname `ts-main` because of
			 * timing	conflicts in tests, must investigate performance
			 * of the selector used instead.
			 * @returns {boolean}
			 */
			outsideMain: function() {
				return !this.spirit.css.matches('[data-ts=Main] *');
			},

			/**
			 * Spirit is positoned before Main (and not inside an Aside)?
			 * @returns {boolean}
			 */
			beforeMain: function() {
				var is = false,
					elm = this.spirit.element;
				if (!this._isinaside() && !this._isinmain()) {
					while (!is && (elm = elm.nextElementSibling)) {
						is = CSSPlugin.contains(elm, 'ts-main');
					}
				}
				return is;
			},

			/**
			 * Spirit is positoned after Main (and not inside an Aside)?
			 * @returns {boolean}
			 */
			afterMain: function() {
				var is = false,
					elm = this.spirit.element;
				if (!this._isinaside() && !this._isinmain()) {
					while (!is && (elm = elm.previousElementSibling)) {
						is = CSSPlugin.contains(elm, 'ts-main');
					}
				}
				return is;
			},

			/**
			 * Add or remove classname(s) on the HTML element.
			 * @param {truthy} on
			 * @param {string|Array<string>} cnames
			 * @returns {ts.ui.LayoutPlugin}
			 */
			shiftGlobal: chained(function(on, cnames) {
				ts.ui.get(document.documentElement, function(root) {
					root.css.shift(on, GuiArray.make(cnames));
				});
			}),

			/**
			 * Flex everything (because of JavaScript based layout).
			 * @returns {ts.ui.LayoutPlugin}
			 */
			flexGlobal: chained(function() {
				ts.ui.get(document.documentElement).reflex();
			}),

			/**
			 * Apply classname based on the current height of some
			 * descendant header or footer. This is known to affect
			 * TableSpirit, PanelSpirit, ModalSpirit and DocumentSpirit
			 * (and it also runs on the StatusBarSpirit itself). This
			 * should of course all be replaced with Grid or Flex now.
			 * @param {number} level
			 * @param {string} [prefix]
			 */
			gotoLevel: function(level, prefix) {
				var css = this.spirit.css;
				prefix = prefix || 'ts-level';
				LEVELS.forEach(function(number) {
					var string = String(number).replace('.', '-');
					css.shift(number === level, prefix + '-' + string);
				});
			},

			/**
			 * Append the spinner.
			 * @param {string} [message]
			 */
			startSpinning: chained(function(message) {
				console.log('start', message);
				if (!this._spinner) {
					this._spinner = this.spirit.dom.append(ts.ui.SpinnerSpirit.summon());
				}
			}),

			/**
			 * Remove the spinner.
			 */
			stopSpinning: chained(function() {
				console.log('stop');
				if (this._spinner) {
					this._spinner.dom.remove();
				}
			}),

			// Private .................................................................

			/**
			 * Spirit of the spinner.
			 * @type {ts.ui.SpinnerSpirit}
			 */
			_spinner: null,

			/**
			 * Spirit is inside some kind of Aside?
			 * @returns {boolean}
			 */
			_isinaside: function() {
				return this.spirit.css.matches('.ts-sideshow *');
			},

			/**
			 * Spirit is inside Main?
			 * @returns {boolean}
			 */
			_isinmain: function() {
				return this.spirit.css.matches('.ts-main *');
			}
		},
		{
			// Static ...............................................................

			/**
			 * @deprecated
			 * @param {truthy} on
			 * @param {string|Array<string>} cnames
			 * @returns {constructor}
			 */
			shift: chained(function(on, cnames) {
				console.error('Deprecated API is deprecated: LayoutPlugin.shift');
			}),

			/**
			 * HTML element has given classname?
			 * TODO: Move to prototype and rename `containsGlobal`
			 * @returns {boolean}
			 */
			contains: function(cname) {
				if (gui.debug) {
					/**
					 * @TODO: this must be synced to root panels setup
					 */
				}
				return ts.ui.get(document.documentElement).css.contains(cname);
			}
		}
	);
})(gui.Array, gui.DOMPlugin, gui.CSSPlugin, gui.Combo.chained);
