/**
 * Spirit of the main content.
 * @extends {ts.ui.Spirit}
 */
ts.ui.ContentSpirit = ts.ui.LayoutSpirit.extend({
	/**
	 * Setup to track scrolling.
	 * @param {Event} e
	 */
	onconfigure: function() {
		this.super.onconfigure();
		this.broadcast.add(ts.ui.BROADCAST_COMPLETED);
		this.action.add([ts.ui.ACTION_PANEL_ATTACH, ts.ui.ACTION_PANEL_DETACH]);
	},

	/**
	 * TODO: Make sure autofocus is not in a hidden panel!
	 * Handle broadcast.
	 * @param {gui.Broadcast} b
	 */
	onbroadcast: function(b) {
		this.super.onbroadcast(b);
		if (b.type === ts.ui.BROADCAST_COMPLETED) {
			this.attention.trap();
			if (this.dom.q('[autofocus]')) {
				this.attention.enter();
			}
		}
	},

	/**
	 * Handle action.
	 * @param {gui.Action} a
	 */
	onaction: function(a) {
		this.super.onaction(a);
		if (a.target.dom.parent() === this.element) {
			var panel = a.target;
			switch (a.type) {
				case ts.ui.ACTION_PANEL_ATTACH:
					panel.element.addEventListener('scroll', this, { passive: true });
					break;
				case ts.ui.ACTION_PANEL_DETACH:
					panel.element.removeEventListener('scroll', this, { passive: true });
					break;
			}
		}
	},

	/**
	 * Handle event.
	 * TODO: Handle multi-Main scenario!
	 * @param {Event} e
	 */
	onevent: function(e) {
		this.super.onevent(e);
		if (e.type === 'scroll') {
			ts.ui.Header.$scroll(e.target.scrollTop);
		}
	},

	// Privileged ................................................................

	/**
	 * Don't allow declarative panels to configure a local tabbar just yet.
	 * @overwrites {ts.ui.LayoutSpirit#$insertTab}
	 */
	$insertTab: function(json, index) {
		console.error('Not allowed (until we know how to handle this on mobile)');
	}
});
