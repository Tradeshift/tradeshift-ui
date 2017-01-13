function toggle(/*...selectors*/) { // eslint-disable-line no-unused-vars
	Array.forEach(arguments, function(selector) {
		ts.ui.get(selector).toggle();
	});
}
function notification() { // eslint-disable-line no-unused-vars
	ts.ui.Notification.info(
		'Focused will be transferred back to the Button when the Notification is closed',
		'Close the Notification, then'
	);
}
