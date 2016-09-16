/**
 * Spirit of the TopBar.
 * @using {ts.ui.TopBar} TopBar
 * @using {gui.Client} Client
 */
ts.ui.TopBarSpirit = (function(TopBar, Client) {	
	
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
			this.super.onconfigure();
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
			if(!this.css.name().includes('ts-bg')) {
				this.dark();
			}
			this.super.onenter();
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
		 * Apparently the scrollbar size is not computed on startup
		 * so we'll just adjust for the scrollbar some 4ms later on.
		 */
		onasync: function() {
			this.super.onasync();
			this._initbreakpoint();
		},

		/**
		 * Update classes on the HTML element as soon as the rendering is done.
		 * @param {TODO} summary
		 * If the TopBar element for some reason was added late, 
		 * we'll need to reflex the page so that js-based layouts 
		 * (as in SideBars) can account for the height of the TopBar.
		 */
		onrender: function(summary) {
			this.super.onrender(summary);
			var tbar = this._model;
			this._setclasses();
			if(this.element.offsetWidth) {
				this._calculate(tbar.tabs);
			}
			if(gui.spiritualized && tbar.hascontent && !this._reflexfixed) {
				var root = document.documentElement;
				ts.ui.get(root).reflex();
				this._reflexfixed = true;
			}
		},
		
		/**
		 * Remove root classnames when the TopBar is removed. 
		 * This to support a docs page (on layout), because the 
		 * TopBar should probably never be removed for real.
		 */
		ondetach: function() {
			this.super.ondetach();
			var root = ts.ui.get(document.documentElement);
			root.css.remove(HAS_TOPBAR);
			root.css.remove(HAS_TOPBAR_TABS);
			root.reflex();
		},
		
		/**
		 * Handle (model) changes.
		 * @param {Array<edb.Change>} changes
		 */
		onchange: function(changes) {
			this.super.onchange(changes);
			changes.forEach(function(c) {
				switch(c.name) {
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
		 * Set the title, but only if it doesn't have weird Mustache syntax.
		 * @param {String} title
		 */
		title: function(title) {
			if (title.indexOf('{') !== 0) {
				ts.ui.TopBar.title(title);
			}
		},
		
		/**
		 * Never be using some other model.
		 * @override {ts.ui.ToolBarSpirit#model}
		 * @returns {ts.ui.TopBarModel}
		 */
		model: function() {
			if(arguments.length) {
				throw new Error('Cannot assign :/');
			}
			return this._model;
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
		 * Breakpoint changed.
		 */
		_onbreakpoint: function() {
			this.super._onbreakpoint();
			this._looknormal(this.css);
		},

		/**
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
			if(ts.ui.isMobilePoint()) {
				var tabs = this.dom.q('.ts-toolbar-tabs', ts.ui.TopBarTabsSpirit);
				if(tabs && tabs.isOpen) {
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
			this.css.shift(!tbar.visible, CLASS_HIDDEN);
		},
		
		/**
		 * Should always show in mobile, otherwise should only 
		 * show if it has content (buttons, tabs, title etc). 
		 * NOTE: THIS BREAKS DEFAULT HTML CONTENT TOPBAR!!!!!
		 * @param {ts.ui.TopBarModel} tbar
		 * @param {string} breakpoint
		 */
		_shouldshow: function(tbar, breakpoint) {
			var is = tbar.visible;
			if(is && breakpoint !== 'mobile') {
				is = tbar.hascontent || tbar.hadcontent;
			}
			return is;
		}
		
	});
	
}(ts.ui.TopBar, gui.Client));
