/**
 * @deprecated
 * @extends {ts.ui.ButtonSpirit}
 */
ts.ui.LinkSpirit = ts.ui.ButtonSpirit.extend({
	/*
	 * Fail miserably for at
	 * least one release cycle.
	 */
	onconstruct: function() {
		this.super.onconstruct();
		console.error('Deprecated spirit is deprecated: ' + this, this);
	}
});
