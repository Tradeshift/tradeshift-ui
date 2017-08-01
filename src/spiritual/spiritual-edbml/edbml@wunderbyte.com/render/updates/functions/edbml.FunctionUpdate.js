/**
 * Updating the functions it is.
 * TODO: revoke all functions from destructed spirit (unless window.unload)
 */
edbml.FunctionUpdate = edbml.Update.extend(
	{
		/**
		 * Update type.
		 * @type {String}
		 */
		type: edbml.Update.TYPE_FUNCTION,

		/**
		 * Setup update.
		 * @param {String} id
		 * @param @optional {Map<String,String>} map
		 */
		onconstruct: function(id, map) {
			this.super.onconstruct();
			this.id = id;
			this._map = map || null;
		},

		/**
		 * Do the update.
		 */
		update: function() {
			var count = 0;
			this.element(function(elm) {
				if (this._map) {
					if ((count = edbml.FunctionUpdate._remap(elm, this._map))) {
						this._report('remapped ' + count + ' keys');
					}
				} else {
					if ((count = edbml.FunctionUpdate._revoke(elm))) {
						this._report('revoked ' + count + ' keys');
					}
				}
			});
		},

		// Private ...................................................................

		/**
		 * Report the update.
		 * @param {String} report
		 */
		_report: function(report) {
			var message = 'edbml.FunctionUpdate ' + report + ' (' + this.$instanceid + ')';
			this.super._report(message);
		}
	},
	{
		// Static .................................................................

		/**
		 * @param {Element} element
		 */
		_revoke: function(element) {
			var att,
				count = 0,
				keys;
			this._getatts(element).forEach(function(x) {
				att = x[1];
				keys = gui.KeyMaster.extractKey(att.value);
				if (keys) {
					keys.forEach(function(key) {
						edbml.$revoke(key);
						count++;
					});
				}
			});
			return count;
		},

		/**
		 * @param {Element} element
		 * @param {Map<String,String>} map
		 */
		_remap: function(element, map) {
			var count = 0,
				oldkeys,
				newkey,
				newval;
			if (Object.keys(map).length) {
				this._getatts(element).forEach(function(x) {
					var elm = x[0];
					var att = x[1];
					if ((oldkeys = gui.KeyMaster.extractKey(att.value))) {
						oldkeys.forEach(function(oldkey) {
							if ((newkey = map[oldkey])) {
								newval = att.value.replace(oldkey, newkey);
								elm.setAttribute(att.name, newval);
								edbml.$revoke(oldkey);
								count++;
							}
						});
					}
				});
			}
			return count;
		},

		/**
		 * Collect attributes from DOM subtree that
		 * somewhat resemble EDBML poke statements.
		 * @returns {Array<Array<Node>>}
		 */
		_getatts: function(element) {
			var val,
				atts = [];
			new gui.Crawler('edbml-crawler-functionupdate').descend(element, {
				handleElement: function(elm) {
					if (elm !== element) {
						Array.forEach(elm.attributes, function(att) {
							val = att.value;
							if (val.includes('edbml.$run') || val.includes('edbml.$get')) {
								atts.push([elm, att]);
							}
						});
						if (elm.spirit && elm.spirit.script.loaded) {
							// ... not our DOM tree
							return gui.Crawler.SKIP_CHILDREN;
						}
					}
				}
			});
			return atts;
		}
	}
);
