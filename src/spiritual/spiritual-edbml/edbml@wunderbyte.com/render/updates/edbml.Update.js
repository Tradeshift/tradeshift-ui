/**
 * Year!
 */
edbml.Update = gui.Class.create(
	Object.prototype,
	{
		/**
		 * Matches hard|atts|insert|append|remove|function
		 * @type {String}
		 */
		type: null,

		/**
		 * Identifies associated element in one of two ways:
		 *
		 * 1) It's the id of an element. Or if no id:
		 * 2) It's the $instanceid of a {gui.Spirít}
		 * @see	{edbml.Update#element}
		 * @type {String}
		 */
		id: null,

		/**
		 * Tracking ancestor element IDs. We use this to regulate whether an
		 * update should be discarded because a hard replace has obsoleted it.
		 * @type {Map<String,boolean>}
		 */
		ids: null,

		/**
		 * Update context window.
		 * @type {Window}
		 */
		window: null,

		/**
		 * Update context document.
		 * @type {Document}
		 */
		document: null,

		/**
		 * Prepare debug summary.
		 */
		onconstruct: function() {
			this._summary = [];
		},

		/**
		 * The update method performs the actual update. Expect methods
		 * _beforeUpdate and _afterUpdate to be invoked at this point.
		 */
		update: function() {},

		/**
		 * Get element associated to this.id. Depending on update type,
		 * this element will be removed or added or updated and so on.
		 * The root element (the one whose spirit is assigned the script)
		 * may be indexed by "$instanceid" if no ID attribute is specified.
		 * @param @optional {function} cb Pathching https://github.com/Tradeshift/docs/issues/141
		 * @param @optional {object} thisp
		 * @returns {Element}
		 */
		element: function(cb, thisp) {
			var spirit,
				element = null;
			if (gui.KeyMaster.isKey(this.id)) {
				if ((spirit = gui.get(this.id))) {
					element = spirit.element;
				}
			}
			if (!element) {
				// updated to return potentially multiple hits :/
				element = document.querySelectorAll('#' + this.id);
			}
			if (element) {
				if (cb) {
					if (element.length) {
						gui.Array.from(element).forEach(function(e) {
							cb.call(this, e);
						}, this);
					} else {
						cb.call(this, element);
					}
				}
			} else {
				if (edbml.debug) {
					console.error('No element to match @id: ' + this.id);
				}
			}
			return element;
		},

		/**
		 * Clean stuff up for what it's worth.
		 */
		dispose: function() {
			this._summary = null;
		},

		// Private ...................................................................

		/**
		 * Tracking attribute changes for debugging.
		 * @type {Array<String>}
		 */
		_summary: null,

		/**
		 * When something changed, dispatch pre-update event.
		 * @param {Element} element
		 * @return {boolean}
		 */
		_beforeUpdate: function(element) {
			var event = 'x-beforeupdate-' + this.type;
			return this._dispatch(element, event);
		},

		/**
		 * When something changed, dispatch post-update event.
		 * @param {Element} element
		 * @return {boolean}
		 */
		_afterUpdate: function(element) {
			var event = 'x-afterupdate-' + this.type;
			return this._dispatch(element, event);
		},

		/**
		 * Dispatch bubbling DOM event for potential handlers to intercept the update.
		 * @param {Element} element
		 * @param {String} name
		 * @return {boolean} False if event was canceled
		 */
		_dispatch: function(element, name) {
			// element might sometimes be undefined under strange (Angular) conditions
			if (element && element.dispatchEvent) {
				var event = document.createEvent('UIEvents');
				event.initEvent(name, true, true);
				return element.dispatchEvent(event);
			} else {
				// console.error('Occasional EDBML dysfunction just happened');
			}
		},

		/**
		 * Report update in debug mode.
		 * @param {String} report
		 */
		_report: function(report) {
			if (edbml.debug) {
				if (gui.KeyMaster.isKey(this.id)) {
					report = report.replace(this.id, '(anonymous)');
				}
				console.debug(report, this.element());
			}
		}
	},
	{},
	{
		// Static .............................................................

		/**
		 * Default replace update. A section of the DOM tree is replaced.
		 * {@see ReplaceUpdate}
		 * @type {String}
		 */
		TYPE_HARD: 'hard',

		/**
		 * Attribute update. The element must have an ID specified.
		 * {@see UpdateManager#hasSoftAttributes}
		 * {@see AttributesUpdate}
		 * @type {String}
		 */
		TYPE_ATTS: 'atts',

		/**
		 * Insertion update: Inserts a child without replacing the parent. Child
		 * siblings must all be Elements and they must all have an ID specified.
		 * {@see SiblingUpdate}
		 * @type {String}
		 */
		TYPE_INSERT: 'insert',

		/**
		 * {@see SiblingUpdate}
		 * @type {String}
		 */
		TYPE_APPEND: 'append',

		/**
		 * Removal update: Removes a child without replacing the parent. Child
		 * siblings must all be Elements and they must all have an ID specified.
		 * {@see SiblingUpdate}
		 * @type {String}
		 */
		TYPE_REMOVE: 'remove',

		/**
		 * EDB function update. Dereferencing functions bound to GUI
		 * events that are no longer associated to any DOM element.
		 * @type {String}
		 */
		TYPE_FUNCTION: 'function'
	}
);
