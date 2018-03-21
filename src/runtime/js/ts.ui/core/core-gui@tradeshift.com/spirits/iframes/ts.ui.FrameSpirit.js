/**
 * Spirit of the IFRAME.
 * @extends {gui.IframeSpirit} and not {ts.ui.Spirit}
 */
ts.ui.FrameSpirit = gui.IframeSpirit.extend(
	{
		/**
		 * Setup listeners for navigation going
		 * on inside the hosted iframe and stuff.
		 */
		onenter: function() {
			this.super.onenter();
			this._models = [];
			this.life.add([
				gui.LIFE_IFRAME_DOMCONTENT,
				gui.LIFE_IFRAME_ONLOAD,
				gui.LIFE_IFRAME_ONHASH,
				gui.LIFE_IFRAME_UNLOAD
			]);
			this.input.connect([ts.ui.LayoutModel]);
		},

		/**
		 * Translate life events (non-bubbling) to actions (bubbling).
		 * Actions are intended for the {ts.top.RootSpirit} to intecept.
		 * @param {gui.Life} l
		 */
		onlife: function(l) {
			this.super.onlife(l);
			switch (l.type) {
				case gui.LIFE_IFRAME_DOMCONTENT:
					this.action.dispatch(ts.ui.ACTION_FRAME_ONDOM, this.contentLocation.href);
					break;
				case gui.LIFE_IFRAME_ONLOAD:
					this.action.dispatch(ts.ui.ACTION_FRAME_ONLOAD, this.contentLocation.href);
					break;
				case gui.LIFE_IFRAME_ONHASH:
					this.action.dispatch(ts.ui.ACTION_FRAME_ONHASH, this.contentLocation.hash);
					break;
				case gui.LIFE_IFRAME_UNLOAD:
					this.action.dispatch(ts.ui.ACTION_FRAME_UNLOAD, this.contentLocation.href);
					break;
			}
		},

		/**
		 * Handle input.
		 * @param {edb.Input} input
		 */
		oninput: function(input) {
			this.super.oninput(input);
			switch (input.type) {
				case ts.ui.LayoutModel:
					this._models.push(input.data);
					break;
			}
		},

		/**
		 * Load src. If the src starts with a #hash, we'll
		 * try to update the hosted document without reload.
		 * @param {String} url
		 * @return {gui.Then}
		 */
		load: function(src) {
			var then = new gui.Then();
			if (src.startsWith('#')) {
				this._updatehash(src, then);
			} else {
				this._loadnewsrc(src, then);
			}
			return then;
		},

		// Private .............................................

		/**
		 * @type {Array<edb.Object>}
		 */
		_models: null,

		/**
		 * Load new src, nuke existing iframe page.
		 * TODO (jmo@):: The machine would AJAX about now.
		 * @param {String} src
		 * @param {gui.Then} then
		 */
		_loadnewsrc: function(src, then) {
			this.src(src);
			then.now();
		},

		/**
		 * Update hash inside the iframe. We can't do this
		 * reliably from the outside without nuking the
		 * (xorigin) iframe page, but we can transmit the
		 * instruction to the contained document(spirit).
		 * @param {string} hash
		 * @param {gui.Then} then
		 */
		_updatehash: function(hash, then) {
			var action = ts.ui.ACTION_GLOBAL_LOCATION_CHANGEHASH;
			this.action.descendGlobal(action, hash);
			then.now();
		},

		/**
		 * Content document spiritualized. Important: This can be used to relay
		 * models "globally" from the chrome to the content, but we're not using
		 * this kind of (Greenfield) stuff now. Since it might still come in
		 * handy, perhaps we better leave this commented code around for a while...
		 * @override {gui.IframeSpirit#_onspiritualized}
		 *
		 _onspiritualized: function() {
		 this.super._onspiritualized();
		 this.action.descendGlobal(
		 ts.ui.ACTION_GLOBAL_MODELS_INITIALIZE,
		 this._mapmodels(this._models)
		 );
		 },
		 */

		/**
		 * Prepare collected models for cross frame posting. Returns
		 * a map indexing the model classname to a serialized model.
		 * @see {ts.ui.DocumentSpirit#_outputmodels}
		 * @param {Array<edb.Object>} models
		 * @return {Map<String,object>}
		 */
		_mapmodels: function(models) {
			var map = Object.create(null);
			this._models.forEach(function(model) {
				map[model.$classname] = model.serializeToString();
			});
			return map;
		}
	},
	{
		// Static .................................................................

		/**
		 * Note: We're not just this thing just now.
		 * TODO (jmo@): Eventually *don't* allow same origin!
		 * @type {String}
		 */
		SANDBOX: 'allow-scripts allow-forms allow-same-origin',

		/**
		 * Summon spirit.
		 * @param @optional {string} opt_src
		 * @param @optional {string} opt_box
		 */
		summon: function(opt_src, opt_box) {
			var iframe = document.createElement('iframe');
			var spirit = this.possess(iframe);
			spirit.css.add(ts.ui.CLASS_IFRAME);
			if (opt_box) {
				iframe.sandbox = opt_box;
			}
			if (opt_src) {
				spirit.load(opt_src);
			}
			return spirit;
		}
	}
);
