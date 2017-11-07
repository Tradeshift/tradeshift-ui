/**
 * Spirit of the header.
 * @extends {ts.ui.MajorBarSpirit}
 * @using {gui.Combo#chained} chained
 */
ts.ui.HeaderBarSpirit = (function using(chained) {
	return ts.ui.MajorBarSpirit.extend(
		{
			/*
		 * Get (or set) the model. This will load the EDBML.
		 * @param {object|ts.ui.ToolBarModel} model
		 */
			model: ts.ui.Spirit.createModelMethod(ts.ui.HeaderBarModel, 'ts.ui.HeaderBarSpirit.edbml'),

			/**
			 * This spirit is not channeled, so we'll need to add this classname manually.
			 */
			onconfigure: function() {
				this.super.onconfigure();
				this.css.add('ts-headerbar');
			},

			/**
		 	 * Index the various bars and watch for rendering updates.
			 * @param {Object} summary
			 */
			onrender: function(summary) {
				this.super.onrender(summary);
				if (summary.first) {
					[
						(this._headerbar = this._getbar('.ts-headerbar-headerbar')),
						(this._centerbar = this._getbar('.ts-headerbar-centerbar')),
						(this._buttonbar = this._getbar('.ts-headerbar-buttonbar'))
					].forEach(function(spirit) {
						spirit.life.add(gui.LIFE_RENDER, this);
					}, this);
					if (this._micro) {
						this.micro();
					}
					this._layout();
					if (this._closeaction) {
						this.showClose(this._closeaction);
					}
				}
			},

			/**
			 * TODO: Future layout optimizations should be done around here!
			 * @param {gui.Life} l
			 */
			onlife: function(l) {
				this.super.onlife(l);
			},

			/**
			 * Get or set the title.
			 * @param {string} [string]
			 * @returns {this|string}
			 */
			title: chained(function(string) {
				var model = this.model();
				if (arguments.length) {
					model.title = string;
				} else {
					return model.title;
				}
			}),

			/**
			 * Get or set the icon image.
			 * @param {string} [string]
			 * @returns {this|string}
			 */
			icon: chained(function(string) {
				var model = this.model();
				if (arguments.length) {
					model.icon = string;
				} else {
					return model.icon;
				}
			}),

			/**
			 * Show the dedicated burger button? Use `null` to hide it again.
			 * @param {Function|null} callback
			 */
			burgerbutton: chained(function(callback) {
				return this.model().burgerbutton.apply(this.model(), arguments);
			}),

			/**
			 * Get or set the tabs.
			 * @param {Array<object>|ts.ui.TabCollection|null} [json]
			 * @returns {this|ts.ui.TabCollection}
			 */
			tabs: chained(function(json) {
				var model = this.model();
				if (arguments.length) {
					if (json === null) {
						model.tabs.clear();
					} else {
						model.tabs = json;
					}
				} else {
					return model.tabs;
				}
			}),

			/**
			 * Get or set the search.
			 * [The buttons will be rendered in the `bufferbar`!]
			 * @param {Object|ts.ui.SearchModel|null} [json]
			 * @returns {this|ts.ui.SearchModel}
			 */
			search: chained(function(json) {
				var model = this.model();
				if (arguments.length) {
					if (json) {
						json.flex = 1; // for now we'll just hack this to support the design...
					}
					model.search = json;
				} else {
					return model.search;
				}
			}),

			/**
			 * Show the closing X button.
			 * @param {Function} [onclick]
			 */
			showClose: chained(function(onclick) {
				if (this.life.rendered) {
					this._headerbar.showClose(onclick);
				} else {
					this._closeaction = onclick;
				}
			}),

			/**
			 * Hide the closing X button.
			 */
			hideClose: chained(function() {
				this._closeaction = null;
				if (this.life.rendered) {
					this._headerbar.hideClose();
				}
			}),

			/**
			 * Header becomes a micro toolbar.
			 * @returns {this}
			 */
			micro: chained(function() {
				this._micro = true;
				if (this.life.rendered) {
					this._headerbar.micro();
				}
			}),

			/**
			 * Header becomes a macro toolbar.
			 * @returns {this}
			 */
			macro: chained(function() {
				this._micro = false;
				if (this.life.rendered) {
					this._headerbar.macro();
				}
			}),

			// Privileged ............................................................

			/**
			 * Implements the "sticky position" of the main header.
			 * @param {number} scroll
			 */
			$scroll: function(scroll) {
				if (scroll === 0) {
					this.sprite.reset();
				} else {
					var stop = 0 - ts.ui.UNIT_TRIPLE;
					var delt = scroll - this._scroll;
					var down = delt > 0;
					var doit = false;
					var next = 0;
					if (down) {
						doit = this.sprite.y > stop;
					} else {
						doit = this.sprite.y < 0;
					}
					if (doit) {
						next = this.sprite.y - delt;
						next = next < stop ? stop : next;
						next = next > 0 ? 0 : next;
						this.sprite.y = next;
					}
				}
				this._scroll = scroll;
			},

			// Private ...............................................................

			/**
			 * @type {ts.ui.ToolBarSpirit}
			 */
			_headerbar: null,

			/**
			 * @type {ts.ui.ToolBarSpirit}
			 */
			_centerbar: null,

			/**
			 * @type {ts.ui.ToolBarSpirit}
			 */
			_buttonbar: null,

			/**
			 * @type {boolean}
			 */
			_micro: false,

			/**
			 * Snapshot scrolling.
			 * @type {number}
			 */
			_scroll: 0,

			/**
			 * Dispatch some action bearing offset info for the general environment to handle.
			 * If no bars are visible, we'll hide ourselves not to show an awkward dropshadow.
			 */
			_layout: function() {
				this.super._layout(ts.ui.ACTION_HEADER_LEVEL, [
					[this._headerbar, 3],
					[this._centerbar, 2],
					[this._buttonbar, 3]
				]);
			}
		},
		{
			// Static ................................................................

			/**
			 * Summon spirit.
			 * @param {boolean} [isglobal]
			 * @returns {ts.ui.HeaderBarSpirit}
			 */
			summon: function(isglobal) {
				return ts.ui.HeaderBarSpirit.possess(document.createElement('header'));
			}
		}
	);
})(gui.Combo.chained);
