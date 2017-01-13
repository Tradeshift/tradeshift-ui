/**
 * Assist the spirit guide (at least until refactored).
 * @using {gui.Crawler} Crawler
 */
gui.Assistant = (function using(Crawler) {
	return {

		/**
		 * Associate element to new instance of Spirit.
		 * @param {Element} elm
		 * @param {constructor} Spirit
		 * @returns {Spirit}
		 */
		$possess: function(elm, Spirit) {
			if (elm.spirit) {
				throw new Error(
					'Cannot repossess element with spirit ' +
					elm.spirit + ' (exorcise first)'
				);
			} else if (!gui.debug || gui.Type.isSpiritConstructor(Spirit)) {
				elm.spirit = new Spirit(elm);
			} else {
				throw new Error(
					'Not a spirit constructor (' + gui.Type.of(Spirit) + ')'
				);
			}
			return elm.spirit;
		},

		/**
		 * If possible, construct and return spirit for element.
		 * TODO: what's this? http://code.google.com/p/chromium/issues/detail?id=20773
		 * TODO: what's this? http://forum.jquery.com/topic/elem-ownerdocument-defaultview-breaks-when-elem-iframe-document
		 * @param {Element} element
		 * @param {Array} channels
		 * @returns {Spirit} or null
		 */
		$maybepossess: function(elm, channels) {
			var hit;
			if (!elm.spirit) {
				if ((hit = this._maybepossess(elm, channels))) {
					this.$possess(elm, hit);
				}
			}
			return elm.spirit;
		},

		/**
		 * Compare elements to channels and instantiate new spirits.
		 * @param {Element} element
		 * @param {boolean} skip Skip the element?
		 * @param {boolean} one Skip the subtree?
		 * @param {Array} channels
		 * @returns {Array<gui.Spirit>} new spirits
		 */
		$detectspirits: function(element, skip, one, channels) {
			var spirit, spirits = []; // classname = gui.CLASS_NOSPIRITS
			var Assistant = this;
			new Crawler(gui.CRAWLER_SPIRITUALIZE).descend(element, {
				handleElement: function(elm) {
					if (!skip || elm !== element) {
						spirit = elm.spirit;
						if (!spirit) {
							spirit = Assistant.$maybepossess(elm, channels);
						}
						if (spirit) {
							if (!spirit.life.attached) {
								spirits.push(spirit);
							}
						}
					}
					if (one) {
						// TODO: investigate why Crawler.STOP didn't quite work out alright
						return Crawler.SKIP_CHILDREN;
					} else if (!elm.childElementCount) {
						return Crawler.SKIP_CHILDREN;
					} else if (elm.hasAttribute('tempname')) {
						return Crawler.SKIP_CHILDREN;
					} else {
						// TODO: interface for this kind of stuff!
						switch (elm.localName) {
							case 'pre':
							case 'code':
								return Crawler.SKIP_CHILDREN;
						}
					}
					return Crawler.CONTINUE;
				}
			});
			return spirits;
		},

		// Private ...................................................................

		/**
		 * Get Spirit constructor for element.
		 *
		 * 1. Test for element `gui` attribute(s)
		 * 2. Test if element matches selectors
		 * @param {Element} element
		 * @returns {function} Spirit constructor
		 */
		_maybepossess: function(elm, channels) {
			var res = null;
			var experimentalattribute = 'data-ts';  // TRADESHIFT HOTFIX
			if (elm.nodeType === Node.ELEMENT_NODE) {
				if (gui.attributes.every(function(fix) {
					if (fix === experimentalattribute) {
						return true;
					} else {
						res = this._maybepossessinline(elm, fix);
						return res === null;
					}
				}, this)) {
					if (channels) {
						channels.every(function(def) { // TODO!!!!!!!!!!!!!!!!!!
							var select = def[0];
							var spirit = def[1];
							if (gui.CSSPlugin.matches(elm, select)) {
								res = spirit;
							}
							return res === null;
						}, this);
					}
				}
			}
			return res;
		},

		/**
		 * Test for spirit assigned using HTML inline attribute.
		 * Special test for "[" accounts for {gui.Spirit#$debug}
		 * @param {Element} elm
		 * @param {Window} win
		 * @param {String} fix
		 * @returns {function} Spirit constructor
		 */
		_maybepossessinline: function(elm, fix) {
			var res = null;
			var att = elm.getAttribute(fix);
			if (gui.Type.isString(att) && !att.startsWith('[')) {
				if (att !== '') {
					res = gui.Object.lookup(att);
					if (!res) {
						console.error(att + ' is not defined.');
					}
				} else {
					res = false; // strange return value implies no spirit for empty string
				}
			}
			return res;
		}
	};
}(gui.Crawler));
