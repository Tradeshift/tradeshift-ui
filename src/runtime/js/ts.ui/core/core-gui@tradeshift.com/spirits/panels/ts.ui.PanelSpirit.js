/**
 * Something that scrolls with a scrollbar.
 * @using {string} ACTION_ATTACH
 * @using {string} ACTION_DETACH
 * @using {string} ACTION_SHOW
 * @using {string} ACTION_HIDE
 */
ts.ui.PanelSpirit = (function using(ACTION_ATTACH, ACTION_DETACH, ACTION_SHOW, ACTION_HIDE, ACTION_CLASS) {
	
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
		 * Open for implementation.
		 * @type {function}
		 */
		onselect: null,
		
		/**
		 * Setup.
		 */
		onconfigure: function() {
			this.super.onconfigure();
			this.action.add([
				ACTION_ATTACH,
				ACTION_SHOW,
				ACTION_HIDE,
				ACTION_CLASS
			]);
		},
		
		/**
		 * Attach.
		 */
		onattach: function() {
			this.super.onattach();
			this.action.dispatch(ACTION_ATTACH, this._isroot());
		},
		
		/**
		 * Detach.
		 */
		ondetach: function() {
			this.super.ondetach();
			this.action.dispatch(ACTION_DETACH, this._isroot());
		},
		
		/**
		 * Consume nested panel actions. When a request for root CSS 
		 * update is found, we'll stamp the action with a pointer to 
		 * this panel (so that root CSS always matches selected panel).
		 * @param {gui.Action} a
		 */
		onaction: function(a) {
			switch(a.type) {
				case ACTION_ATTACH:
				case ACTION_SHOW:
				case ACTION_HIDE:
					a.consume();
					break;
				case ACTION_CLASS:
					if(this._isroot()) {
						a.data.relatedPanel = this;
					}
					break;
				case ts.ui.ACTION_STATUSBAR_LEVEL:
					if(a.target.guilayout.outsideMain()) { // TODO: CSS FOR THIS!
						this.guilayout.gotolevel(a.data);
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
		
		
		// Privileged .............................................................. 
		
		/**
		 *
		 */
		$onselect: function() {
			switch(gui.Type.of(this.onselect)) {
				case 'function':
					this.onselect();
					break;
				case 'string':
					new Function(this.onselect).call(this);
					break;
			}
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
	ts.ui.ACTION_PANEL_ATTACH,
	ts.ui.ACTION_PANEL_DETACH,
	ts.ui.ACTION_PANEL_SHOW,
	ts.ui.ACTION_PANEL_HIDE,
	ts.ui.ACTION_ROOT_CLASSNAMES
));
