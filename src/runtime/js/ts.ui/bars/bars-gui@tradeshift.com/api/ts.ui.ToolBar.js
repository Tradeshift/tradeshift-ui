/**
 * Static methods will forward method calls to the instances
 * while the instances will forward method calls to spirits.
 * To make sure we get this right, we'll generate the class.
 * - Proto: These methods are simply the regular instance methods
 * - Static: These methods are only found on this constructor
 * - Xstatic: These methods are copied onto subclass constructors
 * @extends {ts.ui.Bar}
 * @using {Array<string>} methods
 */
ts.ui.ToolBar = (function using(methods) {
	var statics = { $bars: [] };
	var xstatics = ts.ui.Bar.$staticmethods(methods);
	var protos = gui.Object.extend(ts.ui.Bar.$protomethods(methods), {
		$getbar: function() {
			return this._main.toolbar();
		}
	});
	return ts.ui.Bar.extend(protos, xstatics, statics);
})([
	// these methods are mapped directly to the spirits methods!
	'title',
	'buttons',
	'tabs',
	'search',
	'hide',
	'show',
	'clear',
	'green',
	'blue',
	'purple',
	'dark',
	'lite',
	'white',
	'showClose',
	'hideClose'
]);
