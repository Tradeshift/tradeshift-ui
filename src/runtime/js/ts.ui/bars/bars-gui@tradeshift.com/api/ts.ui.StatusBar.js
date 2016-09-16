/**
 * See comments in "ts.ui.ToolBar.js"
 * @extends {ts.ui.ToolBar}
 * @using {Array<string>} methods
 */
ts.ui.StatusBar = (function using(methods) {
  var statics = {$bars: []};
  var xstatics = ts.ui.Bar.$staticmethods(methods);
  var protos = gui.Object.extend(ts.ui.Bar.$protomethods(methods), { 
    $getbar: function() {
      return this._main.statusbar();
    }
  });
  return ts.ui.ToolBar.extend(protos, xstatics, statics);
}(['message', 'linkable', 'pager']));
