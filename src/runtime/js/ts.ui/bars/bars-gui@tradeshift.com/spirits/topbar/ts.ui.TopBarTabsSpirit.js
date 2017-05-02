/**
 * Spirit of the topbar tabs.
 */
ts.ui.TopBarTabsSpirit = ts.ui.Spirit.extend({
	/**
	 * Tabs are open (in mobile breakpoint)?
	 * @type {boolean}
	 */
	isOpen: false,

	/**
	 * Get ready.
	 */
	onready: function() {
		this.super.onready();
		this.input.connect(ts.ui.LayoutModel);
	},

	/**
	 * TODO(jmo@): Automate this step in Spiritual :/
	 */
	ondestruct: function() {
		this.super.ondestruct();
		this.input.disconnect(ts.ui.LayoutModel);
	},

	/**
	 * Handle input.
	 * TODO: removeObserver when we are sure that there's no new model incoming.
	 * @param {edb.Input} input
	 */
	oninput: function(input) {
		this.super.oninput(input);
		if (input.type === ts.ui.LayoutModel) {
			this._onbreakpoint(input.data.isMobilePoint());
			input.data.addObserver(this);
		}
	},

	/**
	 * Model changed something.
	 * @param {Array<edb.Change>} changes
	 */
	onchange: function(changes) {
		this.super.onchange(changes);
		changes.forEach(function(c) {
			if (c.object instanceof ts.ui.LayoutModel) {
				this._onbreakpoint(c.object.isMobilePoint());
			}
		}, this);
	},

	/**
	 * Handle event.
	 * @param {Event} e
	 */
	onevent: function(e) {
		this.super.onevent(e);
		switch (e.type) {
			case 'click':
				this.event.remove('click');
				if (ts.ui.isMobilePoint()) {
					this._toggle();
				}
				break;
		}
	},

	/**
	 * Handle tween.
	 * @param {gui.Tween} t
	 */
	ontween: function(t) {
		this.super.ontween(t);
		if (t.type === 'ts-tween-tabs') {
			this._expand(t.value);
			if (t.done) {
				this.tween.remove(t.type);
				this._ontoggle();
			}
		}
	},

	/**
	 * Handle broadcast.
	 * @param {gui.Broadcast} b
	 */
	onbroadcast: function(b) {
		this.super.onbroadcast(b);
		switch (b.type) {
			case gui.BROADCAST_MOUSECLICK:
				this.broadcast.removeGlobal(b.type);
				this._time = this.tick.time(function pause() {
					if (this.isOpen) {
						this._toggle();
					}
				}, 100);
				break;
		}
	},

	/**
	 * Make sure we collapse the tabs (in mobile breakpoint)
	 * before we load next so that the animation doesn't jerk.
	 */
	onaction: function(a) {
		this.super.onaction(a);
		if (a.type === ts.ui.ACTION_GLOBAL_LOAD) {
			this._loadargs = a.data;
			a.consume();
		}
	},

	// Privileged ................................................................

	/**
	 * When tabs are expanded in mobile breakpoint, the
	 * {ts.ui.TopBarSpirit} will allow bonus scrolling.
	 * @returns {number}
	 */
	$offsetLimit: function() {
		var items = this.dom.qall('li', ts.ui.Spirit);
		var stops = Number.MAX_VALUE;
		if (items.length) {
			var last = items.pop();
			var init = ts.ui.UNIT_TRIPLE;
			var ends = last.sprite.y + last.box.height + init;
			stops = ends - window.innerHeight;
		}
		return stops;
	},

	// Private ...................................................................

	/**
	 * List items.
	 * @type {Array<ts.ui.Spirit>}
	 */
	_items: null,

	/**
	 * Timeout index.
	 * @type {number}
	 */
	_time: -1,

	/**
	 * Scrolling down?
	 * @type {boolean}
	 */
	_down: false,

	/**
	 * Consume the `gui.Action` that instructs the (Docs website!!) chrome
	 * to load something. We'll dispatch the again again after toggle done.
	 * @type {object} See original dispatch in the `ts.ui#load` method.
	 */
	_loadargs: null,

	/**
	 * Toggle menu open (in mobile breakpoint).
	 * @param @optional {boolean} reset
	 */
	_toggle: function(reset) {
		this._items = this.dom.qall('li', ts.ui.Spirit);
		if (this._items.length > 1) {
			this.css.shift((this.isOpen = !this.isOpen), ts.ui.CLASS_OPEN);
		}
		if (reset) {
			this._expand(1);
			this._ontoggle();
		} else {
			this.tick.cancelTime(this._time);
			this.broadcast.removeGlobal(gui.BROADCAST_MOUSECLICK);
			this.tween.addDispatch('ts-tween-tabs', {
				duration: ts.ui.TRANSITION_NOW,
				timing: 'ease-out'
			});
		}
	},

	/**
	 * Toggle animation done.
	 */
	_ontoggle: function() {
		var root = ts.ui.get('html');
		var load = ts.ui.ACTION_GLOBAL_LOAD;
		var args = this._loadargs;
		if (this.isOpen) {
			this.broadcast.addGlobal(gui.BROADCAST_MOUSECLICK);
			root.action.addGlobal(load, this);
		} else {
			root.action.removeGlobal(load, this);
			if (args) {
				root.action.dispatchGlobal(load, args);
				this._loadargs = null;
			}
			this.tick.time(function() {
				this.event.add('click');
			});
		}
	},

	/**
	 * Position list items.
	 * @param {number} value
	 */
	_expand: function(value) {
		value = this.isOpen ? value : 1 - value;
		this._items.forEach(function(spirit, index) {
			if (!spirit.life.destructed) {
				spirit.sprite.y = 44 * value * index;
			}
		});
	},

	/**
	 * Handle breakpoint change. Fit the scrollbar so that it doesn't go
	 * under the tabs. There's no scrollbar on real mobile (and in OSX),
	 * so few people will notice that this really doesn't look right...
	 * @param {boolean} mobile
	 */
	_onbreakpoint: function(mobile) {
		this.event.shift(mobile, 'click');
		if (!mobile && this.isOpen) {
			this._toggle(true);
		}
	}
});
