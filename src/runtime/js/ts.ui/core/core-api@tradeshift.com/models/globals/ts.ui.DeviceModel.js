/**
 * Global device model (TODO).
 * @extends {ts.ui.GlobalModel}
 */
ts.ui.DeviceModel = ts.ui.Model.extend({

	/**
	 * Friendly name.
	 * @type {string}
	 */
	item: 'device',
	
	/**
	 * Matches "portrait" or "landscape".
	 * Defaults to landscape for desktop.
	 * @type {string}
	 */
	orientation: 'landscape'


}, { // Static .................................................................

	ORIENTATION_LANDSCAPE: 'landscape',
	ORIENTATION_PORTRAIT: 'portrait'

});
