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
		   * Add that global classname.
		   *
			onenter: function() {
				this.super.onenter();
				if (this.guilayout.outsideMain()) {
					this.guilayout.shiftGlobal(true, 'ts-has-header');
					this.css.add('ts-headerbar ts-mainheader'); //  ts-bg-lite
				} else {
					console.error('Not supported');
				}
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
					this._layout();
					if (this._closeaction) {
						this.showClose(this._closeaction);
					}
				}
				this._refresh([this._headerbar, this._centerbar, this._buttonbar]);
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
					json.flex = 1; // for now we'll just hack this to suppor the design :)
					model.search = json;
				} else {
					return model.search;
				}
			}),

			/**
			 * @param {Function} [onclick]
			 */
			showClose: chained(function(onclick) {
				if (this.life.rendered) {
					this._headerbar.showClose(onclick);
				} else {
					this._closeaction = onclick;
				}
			}),

			// Private .................................................................

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
			// Static ...............................................................

			/**
			 * Summon spirit.
			 * @param {boolean} [isglobal]
			 * @returns {ts.ui.HeaderBarSpirit}
			 */
			summon: function(isglobal) {
				return ts.ui.HeaderBarSpirit.possess(document.createElement('header'));
				/*
				var elm = document.createElement('header');
				var spi = ts.ui.HeaderBarSpirit.possess(elm);
				spi.global = isglobal || false;
				return spi;
				*/
			}
		}
	);
})(gui.Combo.chained);
