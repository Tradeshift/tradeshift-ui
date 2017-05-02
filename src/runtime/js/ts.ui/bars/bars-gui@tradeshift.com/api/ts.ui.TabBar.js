/**
 * See comments in "ts.ui.ToolBar.js"
 * @extends {ts.ui.ToolBar}
 * @using {Array<string>} methods (no special methods here just yet!)
 */
ts.ui.TabBar = (function using(methods) {
	var statics = { $bars: [] };
	var xstatics = ts.ui.Bar.$staticmethods(methods);
	var protos = gui.Object.extend(ts.ui.Bar.$protomethods(methods), {
		$getbar: function() {
			return this._main.tabbar();
		}
	});
	return ts.ui.ToolBar.extend(protos, xstatics, statics);
})([]);
