/**
 * Placeholder spirit.
 */
ts.ui.TopBarSpirit = ts.ui.Spirit.extend({
	onconstruct: function() {
		this.super.onconstruct();
		/*
		console.warn(
			'The TopBar is deprecated in favor of the Header. ' +
			'Please remove the TopBar element from your HTML.'
		)
		*/
	}
});
