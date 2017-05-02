/**
 * Spirit of the TopBar.
 * @using {ts.ui.TopBar} TopBar
 * @using {gui.Client} Client
 * @using {gui.Combo.chained} chained
 * @using {gui.Arguments.confirmed} confirmed
 */
ts.ui.TopBarSpirit = (function(TopBar, Client, chained, confirmed) {
	var HAS_TOPBAR = ts.ui.CLASS_HAS_TOPBAR;
	var HAS_TOPBAR_TABS = ts.ui.CLASS_HAS_TOPBAR_TABS;
	var TOPBAR_READY = ts.ui.BROADCAST_GLOBAL_TOPBAR_READY;
	var CLASS_HIDDEN = ts.ui.CLASS_HIDDEN;

	return ts.ui.ToolBarSpirit.extend({
		/**
		 * Always be using this particular model. The model
		 * may have been configured before this spirit exists.
		 */
		onconstruct: function() {
			this.super.onconstruct();
			this.life.hascontent = false;
			this._model = ts.ui.TopBar.$getmodel();
			this._matchcolor(this, this._model);
			this.script.load(ts.ui.ToolBarSpirit.edbml);
			this.script.input(this._model);
			this._model.addObserver(this);
		},

		/**
		 * Cleanup (in case TopBar gets removed).
		 * TODO: this should really be automated!
		 */
		ondestruct: function() {
			this.super.ondestruct();
			this.model().removeObserver(this);
		},

		/**
		 * Setup.
		 */
		onconfigure: function() {
			this.super.onconfigure();
			this.sprite.y = 0;
			this.css.remove(ts.ui.CLASS_MICRO).add(ts.ui.CLASS_MACRO);
		},

		/**
		 * Change it to dark
		 */
		onenter: function() {
			if (!this.css.name().includes('ts-bg')) {
				this.dark();
			}
			this.super.onenter();
		},

		/**
		 * Making sure *not* to call the superclass `onattach` here.
		 * This whole setup could do with a nice refactoring some day.
		 */
		onattach: function() {
			ts.ui.Spirit.prototype.onattach.call(this);
			this._initbreakpoint(true);
		},

		/**
		 * Emergency remove all root classnames if someone removes the TopBar.
		 * Again, making sure *not* to invoke the superclass `ondetach` here.
		 */
		ondetach: function() {
			ts.ui.Spirit.prototype.ondetach.call(this);
			this._initbreakpoint(false);
			var root = ts.ui.get(document.documentElement);
			root.css.remove(HAS_TOPBAR);
			root.css.remove(HAS_TOPBAR_TABS);
			root.reflex();
		},

		/**
		 * When the topbar's ready we tell the Chrome
		 * about it and it will send the defaultTitle
		 */
		onready: function() {
			this.super.onready();
			this.broadcast.dispatchGlobal(TOPBAR_READY);
		},

		/**
		 * Update classes on the HTML element as soon as the rendering is done.
		 * If the TopBar element for some reason was added late, we'll need to
		 * reflex the page so that js-based layouts (as in SideBars) can account
		 * for the height of the TopBar.
		 * @param {TODO} summary
		 */
		onrender: function(summary) {
			this.super.onrender(summary);
			var tbar = this._model;
			this._setclasses();
			if (this.element.offsetWidth) {
				this._calculate(tbar.tabs);
			}
			if (gui.spiritualized && tbar.hascontent && !this._reflexfixed) {
				var root = document.documentElement;
				ts.ui.get(root).reflex();
				this._reflexfixed = true;
			}
		},

		/**
		 * Handle (model) changes.
		 * @param {Array<edb.Change>} changes
		 */
		onchange: function(changes) {
			this.super.onchange(changes);
			changes.forEach(function(c) {
				switch (c.name) {
					case 'color':
						this._matchcolor(this, this._model);
						break;
					case 'visible':
						this._setclasses();
						break;
				}
			}, this);
		},

		/**
		 * Get or set the title (aborting weird Moustache syntax).
		 *
		 * TODO: `this._model` is the TopBarModel, so why did we overwrite this?
		 *
		 * @overwrites {ts.ui.ToolBarSpirit#title}
		 * @param @optional {string} title
		 * @returns {string|ts.ui.TopBarSpirit}
		 */
		title: confirmed('(string)')(
			chained(function(opt_string) {
				if (arguments.length) {
					if (opt_string.trim().indexOf('{') !== 0) {
						this.$hascontent();
						ts.ui.TopBar.title(opt_string);
						this.event.add('click');
						this.$hascontent();
					}
				} else {
					return ts.ui.TopBar.title();
				}
			})
		),

		/**
		 * Never be using some other model.
		 * @override {ts.ui.ToolBarSpirit#model}
		 * @returns {ts.ui.TopBarModel}
		 */
		model: function() {
			if (arguments.length) {
				throw new Error('Cannot assign :/');
			}
			return this._model;
		},

		/**
		 * Make sure this goes via the API so that the
		 * business logic with mobile breakpoint works.
		 * @overwrites {ts.ui.ToolBarSpirit#hide}
		 * @throws {Error}
		 */
		hide: function() {
			throw new Error('Please use ts.ui.TopBar.hide()');
		},

		/**
		 * Make sure this goes via the API.
		 * @overwrites {ts.ui.ToolBarSpirit#hide}
		 * @throws {Error}
		 */
		show: function() {
			throw new Error('Please use ts.ui.TopBar.show()');
		},

		// Private .................................................................

		/**
		 * @type boolean
		 */
		_reflexfixed: false,

		/**
		 * Handled elsehow...
		 * @param {boolean} attaching
		 * @overwrites {ts.ui.ToolBarSpirit#_layoutinit}
		 */
		_layoutinit: function(attaching) {},

		/**
		 * In mobile breakpoint, the TopBar is "floating" and that
		 * looks better when we make some room for the scrollbar
		 * (at least on platforms where the scrollbar even exists).
		 * @param {gui.CSSPlugin} css
		 */
		_looknormal: function(css) {
			css.right = ts.ui.isMobilePoint() ? Client.scrollBarSize : '';
		},

		/**
		 * TODO: Fix this elsehow!
		 * The idea here is to allow for more TopBar negative scrolling
		 * when the tabs are open in mobile breakpoint, but it turns out
		 * not to work after all :/
		 * @overrides {ts.ui.BarSpirit#_offsetlimit}
		 * @returns {number}
		 */
		_offsetLimit: function() {
			var stop = this.super._offsetLimit();
			if (ts.ui.isMobilePoint()) {
				var tabs = this.dom.q('.ts-toolbar-tabs', ts.ui.TopBarTabsSpirit);
				if (tabs && tabs.isOpen) {
					stop = tabs.$offsetLimit();
				}
			}
			return stop;
		},

		/**
		 * Update classes on myself plus root element.
		 */
		_setclasses: function() {
			var tbar = this._model;
			var show = this._shouldshow(tbar, ts.ui.breakpoint);
			var tabs = this.dom.q('.ts-topbar-tabs');
			var root = ts.ui.get(document.documentElement);
			root.css.shift(show, HAS_TOPBAR);
			root.css.shift(tabs, HAS_TOPBAR_TABS);
			this.css.shift(!show, CLASS_HIDDEN);
		},

		/**
		 * Should always show in mobile, otherwise should only
		 * show if it has content (buttons, tabs, title etc)
		 * or if now empty but used to have some of that stuff.
		 * @param {ts.ui.TopBarModel} tbar
		 * @param {string} breakpoint
		 */
		_shouldshow: function(tbar, breakpoint) {
			if (breakpoint === 'mobile') {
				return true;
			} else {
				return tbar.visible && (this.life.hascontent || tbar.hascontent || tbar.hadcontent);
			}
		}
	});
})(ts.ui.TopBar, gui.Client, gui.Combo.chained, gui.Arguments.confirmed);
