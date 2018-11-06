/**
 * Updating the functions it is.
 * TODO: revoke all functions from destructed spirit (unless window.unload)
 */
edbml.FunctionUpdate = (function() {
	/**
	 * Convert `data-onclick` attribute into an `onclick` event listener.
	 * @param {Element} elm
	 * @param {Attribute} att
	 * @param {string} key
	 */
	function setup(elm, att, key) {
		if (ispoke(att)) {
			elm[att.name.split('data-')[1]] = key
				? function() {
						edbml.$run(this, key);
					}
				: null;
		}
	}

	/**
	 * @param {Attribute} att
	 * @returns {boolean}
	 */
	function ispeek(att) {
		return att.name.startsWith('data-ts.') && gui.KeyMaster.isKey(att.value);
	}

	/**
	 * @param {Attribute} att
	 * @returns {boolean}
	 */
	function ispoke(att) {
		return att.name.startsWith('data-on');
	}

	return edbml.Update.extend(
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
					elm,
					count = 0,
					keys;
				this._getatts(element).forEach(function(x) {
					elm = x[0];
					att = x[1];
					keys = gui.KeyMaster.extractKey(att.value);
					if (keys) {
						keys.forEach(function(key) {
							setup(elm, att, null);
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
					oldkeys;
				this._getatts(element).forEach(function(x) {
					var elm = x[0];
					var att = x[1];
					if ((oldkeys = gui.KeyMaster.extractKey(att.value))) {
						oldkeys.forEach(function(oldkey) {
							var newkey = map[oldkey];
							if (newkey) {
								elm.setAttribute(att.name, newkey);
								setup(elm, att, newkey);
								edbml.$revoke(oldkey);
								count++;
							} else {
								setup(elm, att, oldkey);
							}
						});
					}
				});
				return count;
			},

			/**
			 * Collect attributes from DOM subtree that
			 * somewhat resemble EDBML poke statements.
			 * @returns {Array<Array<Node>>}
			 */
			_getatts: function(element) {
				var atts = [];
				new gui.Crawler('edbml-crawler-functionupdate').descend(element, {
					handleElement: function(elm) {
						if (elm !== element) {
							Array.forEach(elm.attributes, function(att) {
								/*
								if(att.value.includes('edbml.$get')) {
									console.error('TODO', att.value);
								}
								val = att.value;
								if (val.includes('edbml.$run') || val.includes('edbml.$get')) {
									atts.push([elm, att]);
								}
								*/

								if (ispeek(att) || ispoke(att)) {
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
})();
