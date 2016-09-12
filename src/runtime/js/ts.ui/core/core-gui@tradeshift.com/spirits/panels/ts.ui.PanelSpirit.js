/**
 * Something that scrolls with a scrollbar.
 * @using {string} ACTION_ENTER
 * @using {string} ACTION_SHOW
 * @using {string} ACTION_HIDE
 */
ts.ui.PanelSpirit = (function using(ACTION_ENTER, ACTION_SHOW, ACTION_HIDE, ACTION_CLASS) {
	
	return ts.ui.Spirit.extend({

		/**
		 * For when the panel is used to generate tabs.
		 * @type {string} label
		 */
		label: null,
		
		/**
		 * For when the panel is used to generate tabs.
		 * @type {string} label
		 */
		icon: null,

		/**
		 * Panel is visible? (please use methods `hide` and `show`).
		 * @type {boolean} visible
		 */
		visible: true,
		
		/**
		 * Setup.
		 */
		onconfigure: function() {
			this.super.onconfigure();
			this.action.add([
				ACTION_ENTER,
				ACTION_SHOW,
				ACTION_HIDE,
				ACTION_CLASS
			]).dispatch(ACTION_ENTER, this._isroot());
		},
		
		/**
		 * Consume nested panel actions. When a request for root CSS 
		 * update is found, we'll stamp the action with a pointer to 
		 * this panel (so that root CSS always matches selected panel).
		 * @param {gui.Action} a
		 */
		onaction: function(a) {
			switch(a.type) {
				case ACTION_ENTER:
				case ACTION_SHOW:
				case ACTION_HIDE:
					a.consume();
					break;
				case ACTION_CLASS:
					if(this._isroot()) {
						a.data.relatedPanel = this;
					}
					break;
			}
		},
		
		/*
		 * Show the panel.
		 */
		show: function() {
			this.visible = true;
			this.dom.show();
			this.reflex();
			this.action.dispatch(ACTION_SHOW, this._isroot());
		},

		/*
		 * Hide the panel.
		 */
		hide: function() {
			this.dom.hide();
			this.visible = false;
			this.action.dispatch(ACTION_HIDE, this._isroot());
		},
		
		
		// Private .................................................................
		
		/**
		 * Is root level panel?
		 * @returns {boolean}
		 */
		_isroot: function() {
			return this.dom.parent() === document.body;
		}

	});
	
}(
	ts.ui.ACTION_PANEL_ENTER,
	ts.ui.ACTION_PANEL_SHOW,
	ts.ui.ACTION_PANEL_HIDE,
	ts.ui.ACTION_ROOT_CLASSNAMES
));
