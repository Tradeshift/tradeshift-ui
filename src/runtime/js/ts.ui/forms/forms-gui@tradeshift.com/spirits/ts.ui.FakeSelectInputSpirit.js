/**
 * Spirit of the input field that acts like a SELECT element.
 * NOTE: All this business logic should be moved into the Menu API so
 * that someone else can create his own implementation of a "fake select"
 * with just a few lines of code. Not now though.
 * @extends {ts.ui.FakeInputSpirit}
 * @using {gui.Combo#chained}
 * @using {gui.Arguments.confirmed} confirmed
 * @using {string} tick
 * @using {number} time
 * @using {gui.Array} guiArray
 */
ts.ui.FakeSelectInputSpirit = (function using(chained, confirmed, tick, time, guiArray) {
	/**
	 * @param {HTMLOptionsCollection} options
	 * @returns {Array<number>}
	 */
	function selectedoptions(options) {
		return guiArray
			.from(options)
			.map(selectedindexes)
			.filter(selectedonly);
	}

	/**
	 * @param {HTMLOption} option
	 * @param {number} index
	 */
	function selectedindexes(option, index) {
		return option.selected ? index : -1;
	}

	/**
	 * @param {number} index
	 * @returns {boolean}
	 */
	function selectedonly(index) {
		return index > -1;
	}

	return ts.ui.FakeInputSpirit.extend({
		/**
		 * Proxy the actual SELECT element.
		 * @param {HTMLSelectElement} select
		 * @returns {ts.ui.FakeSelectInputSpirit}
		 */
		proxy: chained(function(select) {
			this.super.proxy(select);
			this.disabled = select.disabled;
			if (select.multiple) {
				this._selectedIndexes = [];
			}
			this._initialupdate(select);
			if (select.spirit) {
				var spirit = this;
				select.spirit.att.add('disabled', {
					onatt: function(att) {
						// TODO (jmo@): check that this is "live"
						spirit.disabled = select.disabled;
					}
				});
			}
		}),

		/**
		 * Sync fake select to real select.
		 * @param {gui.Tick} t
		 */
		ontick: function(t) {
			this.super.ontick(t);
			if (t.type === tick) {
				if (!this._proxyspirit.$destructed) {
					this._syncfake(this._proxyelement, this._menumodel);
				}
			}
		},

		/**
		 * Get or set the search.
		 * TODO: The search will probably move to the Aside toolbar.
		 * @param @optional {Array<object>} opt_json
		 * @returns {ts.ui.SearchModel|ts.ui.ToolBarSpirit}
		 */
		search: confirmed('(object)')(
			chained(function(opt_json) {
				var Model = ts.ui.SearchModel;
				var model = this._searchmodel;
				if (arguments.length) {
					if (model) {
						model.dispose();
					}
					this._searchmodel = new Model(opt_json);
				} else {
					if (!model) {
						this.search({});
					}
					return this._searchmodel;
				}
			})
		),

		// Private .................................................................

		/**
		 * Aside that opens.
		 * @type {ts.ui.AsideModel}
		 */
		_aside: null,

		/**
		 * Proxied select element.
		 * @type {HTMLSelectElement}
		 */
		_select: null,

		/**
		 * Tracking selected index (select single scenario).
		 * @type {number}
		 */
		_selectedIndex: -1,

		/**
		 * Tracking selected indexes (select multiple scenario).
		 * @type {Array<number>}
		 */
		_selectedIndexes: null,

		/**
		 * SearchModel no less.
		 * @type {ts.ui.SearchModel}
		 */
		_searchmodel: null,

		/**
		 * @type {number}
		 */
		_optionslength: -1,

		/**
		 * Initial update going on.
		 * @param {HTMLSelectElement} select
		 */
		_initialupdate: function(select, again) {
			this._syncfake(select);
			this.tick.add(tick).start(tick, time);
		},

		/**
		 * Match label to selected option.
		 * @param @optional {number} length (nastyhack for multiple selects)
		 */
		_updatestatus: function(length) {
			var multiple = this._proxyelement.multiple;
			var options = this._proxyelement.options;
			this._optionslength = options.length;
			if (multiple) {
				var indexes = this._getindexes(options);
				length = arguments.length ? length : indexes.length;
				this.value = length + ' selected'; // TODO: Localization needed!!!!!!!!!
				this._selectedIndexes = indexes;
			} else {
				var index = (this._selectedIndex = this._proxyelement.selectedIndex);
				this.value = options[index] ? options[index].text : '';
			}
		},

		/**
		 * Get selected indexes.
		 * @returns {Array<number>}
		 */
		_getindexes: function(options) {
			if (this._proxyelement.multiple) {
				return selectedoptions(options);
			} else {
				return [];
			}
		},

		/**
		 * Change selection index (on the actual SELECT element).
		 * TODO(jmo@): Implement this as a callback on the Menu!
		 * @param {number} index
		 */
		_doselectone: function(index) {
			var select = this._proxyelement;
			if (index !== select.options.selectedIndex) {
				select.options.selectedIndex = index;
				this._triggerchange();
			}
		},

		/**
		 * Change selected options (on the actual SELECT element).
		 * TODO(jmo@): Implement this as a callback on the Menu!
		 * @param {Array<number>} indexes
		 */
		_doselectmany: function(indexes) {
			var options = gui.Array.from(this._proxyelement.options);
			var changed = options.reduce(function(result, option, index) {
				var was = option.selected;
				option.selected = indexes.indexOf(index) > -1;
				return result || option.selected !== was;
			}, false);
			if (changed) {
				this._triggerchange();
			}
		},

		/**
		 * Compute JSON for the {ts.ui.MenuModel} items collection.
		 * @returns {Array<object>}
		 * @param {HTMLSelectElement} select
		 */
		_computemodelitems: function(select) {
			return Array.map(select.options, function(option) {
				return {
					label: option.text,
					visible: !!option.text,
					disabled: option.disabled
				};
			});
		},

		/**
		 * Check the custom before open aside
		 */
		_maybeopen: function() {
			var select = this._proxyelement;
			if (ts.ui.get(select).custom) {
				select.click();
				return;
			}
			this.super._maybeopen();
		},

		/**
		 * @param {Function} onclosed
		 */
		_openaside: function(onclosed) {
			this._open(this._proxyelement, this._proxyelement.options, onclosed);
		},

		// Aside ...................................................................

		/**
		 * Open the Aside.
		 * TODO(jmo@): Much too much scoped action going on, externalize this code?
		 * @param {HTMLSelectElement} select
		 * @param {HTMLOptionsCollection} options
		 */
		_open: function(select, options, onclosed) {
			var that = this,
				aside,
				menu,
				observer,
				multiple = select.multiple,
				oldindex = options.selectedIndex;

			// @param {function} action
			// @param {number} wait
			function when(action, wait) {
				gui.Tick.time(action, wait || 0);
			}

			// create the aside (setup to show all items when opened)
			aside = ts.ui.Aside({
				id: select.id || null,
				title: this._labeltitle(),
				autofocus: false,
				suspendopen: true,
				onbeforeopened: function() {
					aside.focus();
					when(function focusdone() {
						menu.showallitems();
						when(function edbmldone() {
							aside.unsuspendopen();
						});
					}, 25);
				},
				onclose: function() {
					// TODO: update text now, trigger `change` later
					that._onasideclose(menu, observer);
				},
				onclosed: function() {
					that._onasideclosed(menu, observer);
					onclosed.call(that);
					menu.dispose();
					this.dispose();
				}
			});

			// create the menu (setup to show only some items while opening)
			menu = this._menumodel = ts.ui.Menu({
				select: multiple ? 'many' : 'one',
				items: this._computemodelitems(select),
				selectedIndex: multiple ? -1 : oldindex,
				selectedIndexes: this._getindexes(options),
				maxItemsShown: this._getminimumitemscount(),
				search: function(item, value) {
					// TODO: will be moved to the Aside?
					var label = item.label.toLowerCase();
					return label.startsWith(value.toLowerCase());
				}
			});

			// custom label for the "Done" button (in multiple selects)?
			if (multiple) {
				var button;
				this._label(function(label) {
					if ((button = label.dom.q('button'))) {
						menu.donebuttonlabel = button.textContent;
					}
				});
			}

			// create menu observer
			// TODO: implement this stuff as an 'onchange' callback (on the Menu)
			observer = {
				onchange: function(changes) {
					changes.forEach(function(change) {
						switch (change.object) {
							case menu:
								if (change.name === 'selectedIndex') {
									var newindex = change.newValue;
									var oldindex_ = that._selectedIndex;
									if (newindex !== oldindex_) {
										gui.Tick.time(function dramaticpause() {
											aside.close();
										}, 150);
									}
								}
								if (change.name === 'donebuttonpressed') {
									if (menu.select === 'many') {
										that._updatestatus(menu.selectedIndexes.length);
										aside.close();
									}
								}
								break;
							case menu.selectedIndexes:
								menu.donebuttonenabled = true;
								break;
						}
					});
				}
			};

			// launch everything
			menu.addObserver(observer);
			menu.selectedIndexes.addObserver(observer);
			aside.items.push(menu);
			aside.open();
		},

		/**
		 * Max items on screen roughly accounting for Aside
		 * title and panel paddeng (will compute better later).
		 */
		_getminimumitemscount: function() {
			return ts.ui.MenuSpirit.$maxItemsCount() - 2;
		},

		/**
		 * Fetch aside title from containing label.
		 * Simultaneously apply "fake focus" class.
		 * @return {string}
		 */
		_labeltitle: function() {
			return (
				this._label(function(label) {
					return label.text();
				}) || ''
			);
		},

		/**
		 * Cleanup when aside is about to close.
		 * @param {ts.ui.MenuModel} menu
		 * @param {strangeobject} observer
		 */
		_onasideclose: function(menu, observer) {
			menu.removeObserver(observer); // TODO: auto when disposed!
			menu.selectedIndexes.removeObserver(observer);
			if (menu.select === 'one') {
				this._instantfeedback(menu.selectedIndex);
			}
		},

		/**
		 * We've set it up so that the `change` event doesn't trigger
		 * until the Aside is fully closed (so that the animation is
		 * not ruined by other activity), but here we hack it so that
		 * there is instant visual feedback when selection changes.
		 * @param {number} index
		 */
		_instantfeedback: function(index) {
			var options = this._proxyelement.options;
			if (options[index]) {
				this.value = options[index].text;
			}
		},

		/**
		 * Update when aside fully is closed.
		 * @param {ts.ui.MenuModel} menu
		 * @param {strangeobject} observer
		 */
		_onasideclosed: function(menu, observer) {
			switch (menu.select) {
				case 'one':
					this._doselectone(menu.selectedIndex); // TODO: check this with the iPad :/
					break;
				case 'many':
					if (menu.donebuttonpressed) {
						this._doselectmany(menu.selectedIndexes);
					}
					break;
			}
			this._menumodel = null;
		},

		// Sync ....................................................................

		/**
		 * Sync the fake select to the real select. Note that
		 * this method is runs periodically on a {gui.Tick}.
		 * The strange cornercase hack is supposed to fix a
		 * mysterious bug somewhere in V4 where a SELECT with
		 * only a single option would simply not update after
		 * an asynchronous operation.
		 * @param {HTMLSelectElement} select The real SELECT element
		 * @param {ts.ui.MenuModel} model Exists only when Aside is open
		 */
		_syncfake: function(select, model) {
			var cornercase = select.options.length && !this.element.value;
			this.element.placeholder = select.getAttribute('placeholder') || '';
			this.element.disabled = !!select.disabled;
			if (
				cornercase ||
				[
					this._changedlabel(select, this.element.value, model),
					this._changedlength(select, this._optionslength, model),
					this._changedindex(select, this._selectedIndex, model),
					this._changedindexes(select, this._selectedIndexes, model)
				].some(function something(didchange) {
					return didchange;
				})
			) {
				this._updatestatus();
			}
		},

		/**
		 * Sync to SELECT: Options label changed or not?
		 * @param {HTMLSelectElement} select
		 * @param {string} oldlabel
		 * @returns {boolean}
		 */
		_changedlabel: function(select, oldlabel) {
			var did = false;
			if (!select.multiple && select.selectedIndex > -1) {
				if (oldlabel !== select.options[select.selectedIndex].text) {
					did = true;
				}
			}
			return did;
		},

		/**
		 * Sync to SELECT: Options added or removed?
		 * @param {HTMLSelectElement} select
		 * @param {number} oldlength
		 * @param {ts.ui.MenuModel} model
		 * @returns {boolean}
		 */
		_changedlength: function(select, oldlength, model) {
			var did = select.options.length !== oldlength;
			if (did && model) {
				model.items = this._computemodelitems(select);
			}
			return did;
		},

		/**
		 * Sync to SELECT single: index changed?
		 * @param {HTMLSelectElement} select
		 * @param {number} oldindex
		 * @param {ts.ui.MenuModel} model
		 * @returns {boolean}
		 */
		_changedindex: function(select, oldindex, model) {
			var did = false,
				newindex;
			if (!select.multiple) {
				newindex = select.selectedIndex;
				if ((did = newindex !== oldindex)) {
					if (model) {
						model.selectedIndex = newindex;
					}
				}
			}
			return did;
		},

		/**
		 * Sync to SELECT multiple: indexes changed?
		 * @param {HTMLSelectElement} select
		 * @param {number} oldlength
		 * @param {ts.ui.MenuModel} model
		 * @returns {boolean}
		 */
		_changedindexes: function(select, oldindexes, model) {
			var did = false,
				newindexes;
			if (select.multiple) {
				newindexes = this._getindexes(select.options);
				if (guiArray.diffSymmetric(newindexes, oldindexes).length > 0) {
					did = true;
					if (model) {
						// make sure not to reassign the list (this would kill the observer)
						var list = model.selectedIndexes;
						while (list.length) {
							list.pop();
						}
						newindexes.forEach(function(i) {
							list.push(i);
						});
					}
				}
			}
			return did;
		}
	});
})(
	gui.Combo.chained,
	gui.Arguments.confirmed,
	ts.ui.FieldSpirit.TICK_SYNC,
	ts.ui.FieldSpirit.TICK_TIME,
	gui.Array
);
