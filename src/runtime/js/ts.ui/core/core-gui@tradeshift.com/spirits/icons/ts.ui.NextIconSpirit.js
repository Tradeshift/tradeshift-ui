/**
 * CURRENTLY USED ONLY IN THE DOCS WEBSITE.
 * @using {gui.URL} URL
 * @using {gui.Request} Request
 * @using {gui.Client} Client
 * @using {gui.HTMLParser} parser
 */
ts.ui.NextIconSpirit = (function(URL, Request, Client, Parser) {
	/**
	 * Cache resolved (external) bundles.
	 * @type {Map<string, Document>}
	 */
	var bundles = {};

	/**
	 * Cache resolved icons.
	 * @type {Map<string, Element>}
	 */
	var icons = {};

	/**
	 * @param {Map<string, Array<Function>>}
	 */
	var queues = {};

	/**
	 * Always append a cloned icon.
	 * @param {SVGElement} icon
	 * @returns {SVGElement}
	 */
	function clone(icon) {
		return icon.cloneNode(true);
	}

	return ts.ui.Spirit.extend({

		/**
		 * Monitor the `src` attribute.
		 */
		onconfigure: function() {
			this.super.onconfigure();
			this.att.add('src');
		},

		/**
		 * Handle attribute changed.
		 * @param {gui.Att} att
		 */
		onatt: function(att) {
			this.super.onatt(att);
			if (att.name === 'src') {
				var src = att.value.trim();
				if (!att.value.startsWith('{')) {
					this._geticon(src).then(function(icon) {
						this.dom.empty().append(icon);
					}, this);
				}
			}
		},

		// Private .................................................................

		/**
		 * Get the icon.
		 * TODO: Resolve icon from external URL
		 * @param {string} src
		 * @returns {gui.Then}
		 */
		_geticon: function(src) {
			var icon = icons[src];
			var then = new gui.Then();
			if (!icon) {
				if (src.startsWith('#')) {
					if ((icon = document.querySelector(src))) {
						icons[src] = icon;
					} else {
						throw new Error(src + ' not found');
					}
				} else if (src.includes('#')) {
					var gurl = new URL(document, src);
					var path = gurl.pathname;
					var hash = gurl.hash;
					this._getexternal(path, hash, then);
				} else {
					throw new Error('Missing #identifier in ' + src);
				}
			}
			if (icon) {
				then.now(clone(icon));
			}
			return then;
		},

		/**
		 * @param {string} src
		 * @param {gui.Then} then
		 */
		_getexternal: function getexternal(path, hash, then) {
			var exist = bundles[path];
			var loads = exist && (exist instanceof Request);
			if (!exist || loads) {
				this._loadexternal(path, loads, function onload() {
					getexternal(path, hash, then);
				});
			} else if (hash.length > 1) {
				var icon = exist.querySelector(hash);
				if (icon) {
					then.now(clone(icon));
				}
			} else {
				console.error('Icon #id missing');
			}
		},

		/**
		 * @param {string} path
		 * @param {}
		 */
		_loadexternal: function(path, loads, callback) {
			var queue = queues[path] || (queues[path] = []);
			queue.push(callback);
			if (!loads) {
				var request = bundles[path] = new Request(path);
				request.accept('image/svg+xml').get().then(function(status, svg) {
					if (status === 200) {
						bundles[path] = Parser.parseToDocument(svg);
						while (queue.length) {
							queue.shift()();
						}
					} else {
						console.error(path + ' status:' + status);
					}
				}, this);
			}
		}

	});
}(gui.URL, gui.Request, gui.Client, gui.HTMLParser));
