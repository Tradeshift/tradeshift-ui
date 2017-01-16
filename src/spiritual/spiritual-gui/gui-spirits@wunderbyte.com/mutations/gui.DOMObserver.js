/**
 * Monitor document for unsolicitated DOM changes and spiritualize
 * elements accordingly. This patches a missing feature in Safari
 * that blocks us from overriding native DOM getters and setters
 * (eg. `innerHTML`). Importantly note that spirits will be attached
 * and detached *asynchronously* with this.
 * @using {gui.Type} Type
 * @using {gui.Array} GuiArray
 */
gui.DOMObserver = (function using(Type, GuiArray) {
	/*
	 * Handle mutations?
	 */
	var connected = true;

	/*
	 * Counting stuff that suspends mutation handling.
	 */
	var suspend = 0;

	/**
	 * Node is element?
	 * @param {Node} node
	 * @returns {boolean}
	 */
	function iselement(node) {
		return node && node.nodeType === Node.ELEMENT_NODE;
	}

	/**
	 * Materialize (whole subtree).
	 * @param {Element} node
	 */
	function materialize(node) {
		var webkithack = true;
		gui.materialize(node, webkithack);
	}

	/**
	 * Spiritualize (whole subtree).
	 * @param {Element} node
	 */
	function spiritualize(node) {
		gui.spiritualize(node);
	}

	/**
	 * Building arrays from nodelists so that they are easier to work with.
	 * @param {Array} array
	 * @param {NodeList} nodelist
	 */
	function concatenate(array, nodelist) {
		return array.concat(GuiArray.from(nodelist));
	}

	/**
	 * Collect added or removed nodes from list of mutations.
	 * @param {Array<MutationRecord>} mutations
	 * @param {boolean} added
	 */
	function collect(mutations, added) {
		return mutations.reduce(function toarray(result, mutation) {
			return concatenate(result, added ? mutation.addedNodes : mutation.removedNodes);
		}, []);
	}

	/**
	 * Collect added nodes (while removing duplicates: Nodes that moved around).
	 * @param {Array<MutationRecord>} mutations
	 */
	function addednodes(mutations) {
		var added = collect(mutations, true);
		return added.filter(function duplicate(node, i) {
			return added.indexOf(node) === i;
		});
	}

	/**
	 * Collect removed nodes (while removing nodes reinserted elsewhere).
	 * @param {Array<MutationRecord>} mutations
	 * @param {Array<Element>} added
	 */
	function removednodes(mutations, added) {
		var removed = collect(mutations, false);
		return removed.filter(function reinserted(node) {
			return added.indexOf(node) === -1;
		});
	}

	/**
	 * Main MutationObserver callback.
	 * @param {Array<MutationRecord>} mutations
	 */
	function handlemutations(mutations) {
		if (connected) {
			var added = addednodes(mutations);
			var removed = removednodes(mutations, added);
			removed.filter(iselement).forEach(materialize);
			added.filter(iselement).forEach(spiritualize);
		}
	}

	return {

		/**
		 * Enabled?
		 * @type {boolean}
		 */
		observes: false,

		/**
		 * Start observing. Note that this runs in WebKit only.
		 * @see {gui.Guide#_spiritualizeinitially}
		 */
		observe: function() {
			if (gui.Client.hasMutations) {
				this.observes = true;
				var Observer = this._mutationobserver();
				new Observer(handlemutations).observe(document, {
					childList: true,
					subtree: true
				});
			} else {
				throw new Error(
					'MutationObserver no such thing: ' +
					'Browser (version) not supported'
				);
			}
		},

		/**
		 * Suspend mutation monitoring of document; enable
		 * monitoring again after executing provided function.
		 * @param {Node} node
		 * @param @optional {function} action
		 * @param @optional {object} thisp
		 * @returns {object} if action was defined, we might return something
		 */
		suspend: function(action, thisp) {
			var res;
			if (this.observes) {
				if (++suspend === 1) {
					connected = false;
				}
			}
			if (Type.isFunction(action)) {
				res = action.call(thisp);
			}
			if (this.observes) {
				this.resume();
			}
			return res;
		},

		/**
		 * Resume monitoring of mutations in document.
		 * @param {Node} node
		 */
		resume: function() {
			if (this.observes) {
				if (--suspend === 0) {
					connected = true;
				}
			}
		},

		// Private .................................................................

		/**
		 * Get MutationObserver.
		 * (IE11 has this now!)
		 * @returns {constructor}
		 */
		_mutationobserver: function() {
			return (
				window.MutationObserver ||
				window.WebKitMutationObserver ||
				window.MozMutationObserver
			);
		}

	};
}(gui.Type, gui.Array));
