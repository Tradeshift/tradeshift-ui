/**
 * Spirit of the tabbox.
 * @extends {ts.ui.Spirit}
 * @using {gui.Combo#chained} chained
 */
ts.ui.TabBoxSpirit = (function using(chained) {
	return ts.ui.BoxSpirit.extend();
})(gui.Combo.chained);
