/**
 * Spirit of the main element.
 */
ts.ui.MainSpirit = ts.ui.Spirit.extend({

	/**
	 * ts.ui.SpinnerSpirit.
	 */
	spin: null,

	/**
	 * @param {string} busy
	 */
	busy: function(busy) {
		var opts = {
			message: gui.Type.isString(busy) ? busy : ''
		};
		if(!busy || !this._isbusy) {
			this._initspin(busy, opts);
			if(busy){
				this.guistatus.busy(this.$instanceid);
				this._isbusy = true;
			}else {
				this.guistatus.done(this.$instanceid);
				this._isbusy = false;	
			}
		}
	},

	/**
	 * @param {string} busyblocking
	 */
	blocking: function(busyblocking) {
		var opts = {
			message: busyblocking,
			cover: true,
			color: "#fff",
		};
		this._initspin(busyblocking, opts);
		if(busyblocking){
			this.guistatus.busy(this.$instanceid);	
		}else {
			this.guistatus.done(this.$instanceid);	
		}
	},

	/**
	 * Configure.
	 */
	onconfigure: function() {
		this.super.onconfigure();
		this.element.tabIndex = -1;
		this.attention.trap();
	},

	/**
	 * Trap focus in the MAIN section so that TAB 
	 * won't travel into ASIDE or exit the IFRAME.
	 */
	onready: function() {
		this.super.onready();
		this._inittabs();
		if(this.dom.q('.ts-main-content')) { // TODO: delete this after some releases...
			throw new Error('Classname "ts-main-content" has been renamed to "ts-maincontent"');
		}
		if(gui.debug) {
			if(this.dom.qdocall('.ts-main').length > 1) {
				console.error('Main components should not be nested :/');
			}
		}
	},

	/**
	 * If the `autofocus` element is not focused by now, we'll do just that. 
	 * TODO(jmo@): Perhaps validate that there is only one 'autofocus' arond?
	 */
	onvisible: function() {
		this.super.onvisible();
		var auto = this.dom.q('[autofocus]');
		if (auto && document.activeElement !== auto) {
			auto.focus();
		}
	},
	
	
	// Private ...................................................................

	/**
	 * If more than one panel next to main, generate the tabbar automaticly  
	 * TODO(leo@): Perhaps to watch the panels to add or delete panel in the tabbar
	 */
	_inittabs: function() {
		var direct = 'this > .ts-panel';
		var nested = '.ts-maincontent > .ts-panel';
		var panels = this.dom.qall(direct, ts.ui.PanelSpirit).concat(
			this.dom.qall(nested, ts.ui.PanelSpirit)
		);
		if(panels.length > 1) {
			var tabbar = ts.ui.TabBarSpirit.summon();
			var elm = this.element;
			tabbar.lite();
			this.dom.before(tabbar);
			panels.forEach(function(panel, index) {
				tabbar.tabs().push({
					label: panel.label,
					selected: index === 0,
					$onselect: function() {
						panels.forEach(function(p) {
							if(p === panel) {
								p.show();
								elm.scrollTop = 0; // TODO(jmo@): account for topbar position in mobile breakpoint
							} else {
								p.hide();
							}
						});
					}
				});
			});
			tabbar.script.run(); // TODO(jmo@): Fixes flicker, but should not be needed
		}
	},

	/**
	 * If you set the attribute ts.busy is true, you will see the spinner in the main
	 * param {string} busy
	 * param {object} opts
	 */
	_initspin: function(busy, opts) {
		if (!this.spin) {
			this.spin = ts.ui.SpinnerSpirit.summon();
		}
		if (busy) {
			this.spin.spin(document.body, opts);
		} else {
			this.spin.stop();
		}
	}

});
