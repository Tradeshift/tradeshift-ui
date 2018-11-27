/**
 * We're gonna have to implement this thing sometime soon,
 * but we can't really do so now without *breaking* stuff.
 */
ts.ui.Header = (function(TopBar, TabBar, ToolBar) {
	return {
		buttons: function() {
			return TopBar.buttons.apply(TopBar, arguments);
		},

		tabs: function() {
			return TabBar.buttons.apply(TabBar, arguments);
		}
	};
})(ts.ui.TopBar, ts.ui.TabBar, ts.ui.ToolBar);
