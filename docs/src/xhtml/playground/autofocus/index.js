function toggle(/*...selectors*/) {
  Array.forEach(arguments, function(selector) {
    ts.ui.get(selector).toggle();
  });
}
function notification() {
  ts.ui.Notification.info(
    'Focused will be transferred back to the Button when the Notification is closed',
    'Close the Notification, then'
  );
}
