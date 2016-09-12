/**
 * All sorts of layout relatedness.
 * @using {gui.Array} GuiArray
 * @using {gui.DOMPlugin} DOMPlugin
 * @using {gui.CSSPlugin} CSSPlugin
 * @using {gui.Combo#chained} chained
 */
ts.ui.LayoutPlugin = (function using(GuiArray, DOMPlugin, CSSPlugin, chained) {
	
	return ts.ui.Plugin.extend({

		/**
		 * Spirit is positioned before or after Main (not inside)?
		 * TODO(jmo@): could not use classname `ts-main` because of 
		 * timing  conflicts in tests, must investigate performance 
		 * of the selector used instead.
		 * @returns {boolean}
		 */
		outsideMain: function() {
			return !this.spirit.css.matches('[data-ts=Main] *');
		},

		/**
		 * Spirit is positoned before Main?
		 * @returns {boolean}
		 */
		beforeMain: function() {
			var is = false, elm = this.spirit.element;
			while((!is && (elm = elm.nextElementSibling))) {
				is = CSSPlugin.contains(elm, 'ts-main');
			}
			return is;
		},

		/**
		 * Spirit is positoned after Main?
		 * @returns {boolean}
		 */
		afterMain: function() {
			var is = false, elm = this.spirit.element;
			while((!is && (elm = elm.previousElementSibling))) {
				is = CSSPlugin.contains(elm, 'ts-main');
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
			this.spirit.action.dispatch(ts.ui.ACTION_ROOT_CLASSNAMES, {
				classes: GuiArray.make(cnames),
				enabled: !!on
			});
		})


	}, { // Static ...............................................................

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
			if(gui.debug) {
				console.log('TODO: this must be synced to root panels setup');
			}
			return ts.ui.get(document.documentElement).css.contains(cname);
		}

	});

}(
	gui.Array,
	gui.DOMPlugin,
	gui.CSSPlugin,
	gui.Combo.chained
));
