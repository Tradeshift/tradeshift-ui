/**
 * Crawl structures descending.
 * TODO: Implement 'stop' directive
 */
edb.Crawler = (function() {
	function Crawler() {}
	Crawler.prototype = {
		/**
		 *
		 */
		crawl: function(type, handler) {
			if (edb.Type.is(type)) {
				handle(type, handler);
				crawl(type, handler);
			} else {
				throw new TypeError();
			}
		}
	};

	/**
	 * Note to self: This also crawls array members (via index keys).
	 */
	function crawl(type, handler) {
		gui.Object.each(type, istype).forEach(function(oneType) {
			handle(oneType, handler);
			crawl(oneType, handler);
		});
	}

	function istype(key, value) {
		if (edb.Type.is(value)) {
			return value;
		}
	}

	function handle(type, handler) {
		if (handler.ontype) {
			handler.ontype(type);
		}
		if (handler.onarray) {
			if (edb.Array.is(type)) {
				handler.onarray(type);
			}
		}
		if (handler.onobject) {
			if (edb.Object.is(type)) {
				handler.onobject(type);
			}
		}
	}

	return Crawler;
})();
