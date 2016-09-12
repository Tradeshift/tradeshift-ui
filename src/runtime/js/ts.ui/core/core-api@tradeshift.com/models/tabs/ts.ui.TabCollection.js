/**
 * Advanced collection of tabs.
 * TODO (jmo@): Make sure 'onselect' never triggers twice
 * @extends {ts.ui.Collection}
 */
ts.ui.TabCollection = ts.ui.Collection.extend({

	/**
	 * Content model constructor.
	 * @type {function}
	 */
	$of: ts.ui.TabModel,

	/**
	 * Friendly name.
	 * @type {string}
	 */
	item: 'tabs',

	/**
	 * Selected index accessor.
	 * @type {number}
	 */
	selectedIndex: {
		getter: function() {
			return this._current ? this.indexOf(this._current) : -1;
		},
		setter: function(i) {
			if (i >= 0 && i < this.length) {
				this._toggle(this[i], this._current);
			} else {
				throw new RangeError('Out of range');
			}
		}
	},

	/**
	 * Observe tab selections.
	 * Default select first tab.
	 * @param {Array<gui.TabModel>} tabs
	 */
	onconstruct: function(tabs) {
		this.super.onconstruct();
		this.addObserver(this);
		if (this.length) {
			var that = this;
			this.selectedIndex = tabs.reduce(function(x, tab, i) {
				tab.addObserver(that);
				return tab.selected ? i : x;
			}, 0);
		}
	},

	/**
	 * Handle changes (low level API for now).
	 * @param {Array<edb.ObjectChange>} changes
	 */
	onchange: function(changes) {
		changes.forEach(function(c) {
			switch (c.object.item) {
				case 'tab' :
					this._ontabchange(c);
					break;
				case 'tabs' :
					this._onthischange(c);
					break;
			}
		}, this);
	},


	// Private ...................................................................

	/**
	 * Selected tab.
	 * @type {ts.ui.TabModel}
	 */
	_current: null,

	/**
	 * Last known selected index.
	 * @type {number}
	 */
	_lastknownindex: -1,

	/**
	 * Toggle selection.
	 */
	_toggle: function(newtab, oldtab) {
		if(newtab !== oldtab) {
			if(oldtab) {
				oldtab.unselect();
			}
			this._current = newtab.select();
			this._lastknownindex = this.selectedIndex;
		}
	},

	/**
	 * Tab model changed.
	 * @param {edb.ObjectChange} c
	 */
	_ontabchange: function(c) {
		if (c.type === edb.ObjectChange.TYPE_UPDATE) {
			if (c.name === 'selected' && c.newValue) {
				if(c.object !== this._current) {
					this.selectedIndex = this.indexOf(c.object);
				}
			}
		}
	},

	/**
	 * This (TabCollection) changed.
	 * @param {edb.ArrayChange} c
	 */
	_onthischange: function(c) {
		switch (c.type) {
			case edb.ArrayChange.TYPE_SPLICE:
				this._onsplice(c.object, c.removed, c.added);
				break;
		}
	},

	/**
	 * Tabs were added or removed.
	 * @param {ts.ui.TabCollection<ts.ui.TabModel>} tabs
	 * @param {Array<ts.ui.TabModel} removed
	 * @param {Array<ts.ui.TabModel} added
	 */
	_onsplice: function(tabs, removed, added) {
		var that = this, current = this._current;
		if(removed.length) {
			gui.Tick.next(function allow_multiple_operations() {
				removed.filter(function really_removed(tab) {
					return tabs.indexOf(tab) === -1;
				}).forEach(function(tab) {
					tab.removeObserver(that);
					tab.dispose();
				});
			});
		}
		added.forEach(function(tab) {
			tab.addObserver(that);
			if (tab.selected) {
				this._toggle(tab, current);
			}
		}, this);

		/*
		 * TODO: Make us not depend on this timeout, 
		 * hacking it now for the Client-Docs stuff.
		 */
		setTimeout(function butwhy() {
			this._fallback();	
		}.bind(this));
	},

	/**
	 * Make sure something nice is selected.
	 */
	_fallback: function() {
		if(this.length) {
			if(this.selectedIndex === -1) {
				var last = this._lastknownindex;
				while(last > this.length) {
					last --;
				}
				if(last >= 1) {
					this[last - 1].select();
				} else {
					this[0].select();
				}
			}
		} else {
			this._lastknownindex = -1;
			this._current = null;
		}
	}

});
