/**
 * Tracking asides to manage the cover.
 * Syncing with the top aside plugin.
 * @see {ts.top.DocumentAsidePlugin}
 * @using {gui.Tick} Tick
 */
ts.ui.DocumentAsidePlugin = (function using(Tick) {
	// local actions *from* asides in this context
	var willopen = ts.ui.ACTION_ASIDE_WILL_OPEN,
		didopen = ts.ui.ACTION_ASIDE_DID_OPEN,
		willclose = ts.ui.ACTION_ASIDE_WILL_CLOSE,
		didclose = ts.ui.ACTION_ASIDE_DID_CLOSE,
		willflip = 'FLIP';

	// global broadcasts *for* the top frame aside plugin
	var globaltouchcover = ts.ui.BROADCAST_GLOBAL_COVER_TOUCH,
		globalwillon = ts.ui.BROADCAST_GLOBAL_ASIDES_WILL_ON,
		globaldidon = ts.ui.BROADCAST_GLOBAL_ASIDES_DID_ON,
		globalwilloff = ts.ui.BROADCAST_GLOBAL_ASIDES_WILL_OFF,
		globaldidoff = ts.ui.BROADCAST_GLOBAL_ASIDES_DID_OFF,
		globaldoclose = ts.ui.BROADCAST_GLOBAL_ASIDES_DO_CLOSE;

	// broadcast global
	function announce(msg) {
		gui.Broadcast.dispatchGlobal(msg);
	}

	/**
	 * Flip the spirits.
	 * @param {Array<ts.ui.SideShowSpirit} first
	 * @param {Array<ts.ui.SideShowSpirit} last
	 */
	function flip(first, last) {
		if (first.length) {
			first.slice().forEach(function(spirit, index) {
				spirit.$flip().then(function() {
					gui.Array.remove(first, index);
					if (!first.length && last) {
						flip(last);
					}
				});
			});
		}
	}

	return ts.ui.Plugin.extend({
		/**
		 * Start managing asides.
		 */
		manageasides: function() {
			this._flipins = [];
			this._flipout = [];
			this.spirit.action.add(
				[
					// TODO(jmo@): gui.Action.add() doesn't work :/
					willopen,
					didopen,
					willclose,
					didclose,
					willflip
				],
				this
			);
			gui.Broadcast.addGlobal([globaltouchcover], this);
		},

		/**
		 * Handle action.
		 * @param {gui.Action} a
		 */
		onaction: function(a) {
			var spirit = a.target;
			switch (a.type) {
				case willopen:
					if (++this._asides === 1) {
						announce(globalwillon);
						this._cover().fadeIn();
					}
					break;
				case didopen:
					if (this._asides === 1) {
						announce(globaldidon);
					}
					break;
				case willclose:
					if (--this._asides === 0) {
						announce(globalwilloff);
						this._cover().fadeOut();
					}
					break;
				case didclose:
					if (this._asides === 0) {
						announce(globaldidoff);
					}
					break;
				case willflip:
					(a.data ? this._flipins : this._flipout).push(spirit);
					Tick.add('xxx', this).dispatch('xxx', 4);
					break;
			}
		},

		/**
		 * Upgrade local broadcast to global broadcasts but
		 * only when switching between zero and one aside/dialog.
		 * @param {gui.Broadcast} b
		 */
		onbroadcast: function(b) {
			switch (b.type) {
				case globaltouchcover:
					if (b.data === this._coverid) {
						gui.Broadcast.dispatchGlobal(globaldoclose);
					}
					break;
			}
		},

		/**
		 * Handle tick.
		 * @param {gui.Tick} t
		 */
		ontick: function(t) {
			var out = this._flipout;
			var ins = this._flipins;
			if (t.type === 'xxx') {
				if (out.length) {
					flip(out, ins);
				} else {
					flip(ins);
				}
			}
		},

		// Private .................................................................

		/**
		 * Counting asides opened.
		 * @type {number}
		 */
		_asides: 0,

		/**
		 * ID (and classname) of the aside cover.
		 * @type {string}
		 */
		_coverid: 'ts-asidecover',

		/**
		 * Get-create CoverSpirit for ASIDE things. First
		 * run creates the spirit and appends it to BODY.
		 * @returns {ts.ui.CoverSpirit}
		 */
		_cover: function() {
			return ts.ui.CoverSpirit.getCover(this._coverid);
		}
	});
})(gui.Tick);
