/**
 * Spirit of the SCRIPT tag that
 * contains the (compiled) EDBML.
 */
edbml.ScriptSpirit = gui.Spirit.extend({
	/**
	 * Configured via inline HTML (so by Grunt).
	 * @type {string}
	 */
	scriptid: null,

	/**
	 * Load script into parent spirit. This spirit will
	 * automatically destruct when the script executes.
	 */
	onconfigure: function() {
		this.super.onconfigure();
		if (this.dom.embedded()) {
			var id,
				parent = this.dom.parent(gui.Spirit);
			if (parent && (id = this.scriptid)) {
				parent.script.load(gui.Object.lookup(id));
			}
		}
	}
});
