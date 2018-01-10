ts.dox.VersionsSpirit = (function() {
	return ts.ui.Spirit.extend({
		onenter: function() {
			this.super.onenter();

			/*
			var json = this.dom.q('script').textContent.trim();
			this.script.load(ts.dox.VersionsSpirit.edbml);
			this.script.run(JSON.parse(json));
			*/
		}
	});
})();
