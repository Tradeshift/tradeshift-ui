/**
 * Spirit of the iframe.
 * @extends {gui.Spirit}
 */
gui.IframeSpirit = gui.Spirit.extend(
	{
		/**
		 * Flipped when the *hosted* document is loaded and spiritualized.
		 * @type {boolean}
		 */
		spiritualized: false,

		/**
		 * Fit height to contained document height (seamless style)?
		 * @type {boolean}
		 */
		fit: false,

		/**
		 * Cross domain origin of hosted document (if that's the case).
		 * @type {String} `http://iframehost.com:8888`
		 */
		xguest: null,

		/**
		 * Hosted window.
		 * @type {Window}
		 */
		contentWindow: {
			getter: function() {
				return this.element.contentWindow;
			}
		},

		/**
		 * Hosted document.
		 * @type {Document}
		 */
		contentDocument: {
			getter: function() {
				return this.element.contentDocument;
			}
		},

		/**
		 * URL details for hosted document.
		 * @type {gui.URL}
		 */
		contentLocation: null,

		/**
		 * Construction time.
		 */
		onconstruct: function() {
			this.super.onconstruct();
			this.event.add('message', window);
			this._postbox = [];
		},

		/**
		 * Stamp SRC on startup.
		 * Configure content document events in order of
		 * appearance and resolve current contentLocation.
		 */
		onenter: function() {
			this.super.onenter();
			this.event.add('load');
			this.action.addGlobal([
				// in order of appearance
				gui.ACTION_DOC_ONDOMCONTENT,
				gui.ACTION_DOC_ONLOAD,
				gui.ACTION_DOC_ONHASH,
				gui.ACTION_DOC_ONSPIRITUALIZED,
				gui.ACTION_DOC_UNLOAD
			]);
			if (this.fit) {
				this.css.height = 0;
			}
			var src = this.element.src;
			if (src && src !== gui.IframeSpirit.SRC_DEFAULT) {
				if (!src.startsWith('blob:')) {
					// wrong...
					this._setupsrc(src);
				}
			}
		},

		/**
		 * Handle action.
		 * @param {gui.Action} a
		 */
		onaction: function(a) {
			this.super.onaction(a);
			this.action.$handleownaction = false;
			var base;
			switch (a.type) {
				case gui.ACTION_DOC_ONDOMCONTENT:
					this.contentLocation = new gui.URL(document, a.data);
					this.life.dispatch(gui.LIFE_IFRAME_DOMCONTENT);
					this.action.remove(a.type);
					a.consume();
					break;
				case gui.ACTION_DOC_ONLOAD:
					this.contentLocation = new gui.URL(document, a.data);
					this.life.dispatch(gui.LIFE_IFRAME_ONLOAD);
					this.action.remove(a.type);
					a.consume();
					break;
				case gui.ACTION_DOC_ONHASH:
					base = this.contentLocation.href.split('#')[0];
					this.contentLocation = new gui.URL(document, base + a.data);
					this.life.dispatch(gui.LIFE_IFRAME_ONHASH);
					a.consume();
					break;
				case gui.ACTION_DOC_ONSPIRITUALIZED:
					this._onspiritualized();
					this.life.dispatch(gui.LIFE_IFRAME_SPIRITUALIZED);
					this.action.remove(a.type);
					a.consume();
					break;
				case gui.ACTION_DOC_UNLOAD:
					this._onunload();
					this.life.dispatch(gui.LIFE_IFRAME_UNLOAD);
					this.action.add([
						gui.ACTION_DOC_ONCONSTRUCT,
						gui.ACTION_DOC_ONDOMCONTENT,
						gui.ACTION_DOC_ONLOAD,
						gui.ACTION_DOC_ONSPIRITUALIZED
					]);
					a.consume();
					break;
			}
		},

		/**
		 * Handle event.
		 * @param {Event} e
		 */
		onevent: function(e) {
			this.super.onevent(e);
			switch (e.type) {
				case 'message':
					this._onmessage(e.data, e.origin, e.source);
					break;
				case 'load':
					// now what?
					break;
			}
		},

		/**
		 * Get and set the iframe source. Set in markup using <iframe gui.src="x"/>
		 * if you need to postpone iframe loading until the spirit gets initialized.
		 * @param @optional {String} src
		 * @returns @optional {String} src
		 */
		src: function(src) {
			if (src) {
				this._setupsrc(src);
				this.element.src = src;
			}
			return this.element.src;
		},

		/**
		 * Experimentally load some kind of blob.
		 * @param @optional {URL} url
		 * @param @optional {String} src
		 */
		url: function(url, src) {
			if (src) {
				this._setupsrc(src);
			}
			if (url) {
				this.element.src = url;
			}
			return this.contentLocation.href;
		},

		/**
		 * Post message to content window. This method assumes
		 * that we are messaging Spiritual components and will
		 * buffer the messages for bulk dispatch once Spiritual
		 * is known to run inside the iframe.
		 * @param {String} msg
		 */
		postMessage: function(msg) {
			if (this.spiritualized) {
				this.contentWindow.postMessage(msg, '*');
			} else {
				this._postbox.push(msg);
			}
		},

		// Private ...................................................................

		/**
		 * @param {String} src
		 */
		_setupsrc: function(src) {
			var doc = document;
			this.contentLocation = new gui.URL(doc, src);
			this.xguest = (function(secured) {
				if (secured) {
					return '*';
				} else if (gui.URL.external(src, doc)) {
					var url = new gui.URL(doc, src);
					return url.protocol + '//' + url.host;
				}
				return null;
			})(this._sandboxed());
		},

		/**
		 * Hosted document spiritualized.
		 * Dispatching buffered messages.
		 */
		_onspiritualized: function() {
			this.spiritualized = true;
			while (this._postbox.length) {
				this.postMessage(this._postbox.shift());
			}
			// this._visibility();
		},

		/**
		 * Hosted document changed size. Resize to fit?
		 * Dispatching an action to {gui.DocumentSpirit}
		 * @param {number} height
		 */
		_onfit: function(height) {
			if (this.fit) {
				this.css.height = height;
				this.action.dispatchGlobal(gui.ACTION_DOC_FIT);
			}
		},

		/**
		 * Hosted document unloading.
		 */
		_onunload: function() {
			this.spiritualized = false;
			if (this.fit) {
				this.css.height = 0;
			}
		},

		/**
		 * Handle posted message, scanning for ascending actions.
		 * Descending actions are handled by the documentspirit.
		 * TODO: Don't claim this as action target!
		 * @see {gui.DocumentSpirit._onmessage}
		 * @param {String} msg
		 */
		_onmessage: function(msg, origin, source) {
			if (source === this.contentWindow) {
				if (msg.startsWith('spiritual-action:')) {
					var a = gui.Action.parse(msg);
					if (a.direction === gui.Action.ASCEND) {
						this.action.$handleownaction = true;
						this.action.ascendGlobal(a.type, a.data);
					}
				}
			}
		},

		/**
		 * Iframe is sandboxed? Returns `true` even for "allow-same-origin" setting.
		 * @returns {boolean}
		 */
		_sandboxed: function() {
			var sandbox = this.element.sandbox;
			return sandbox && sandbox.length; // && !sandbox.includes ( "allow-same-origin" );
		}
	},
	{
		// Recurring static .......................................................

		/**
		 * Summon spirit.
		 * TODO: why does spirit.src method fail strangely
		 *			 just now? using iframe.src instead...
		 * @param {Document} doc
		 * @param @optional {String} src
		 * @returns {gui.IframeSpirit}
		 */
		summon: function(doc, src) {
			var iframe = doc.createElement('iframe');
			var spirit = this.possess(iframe);
			spirit.css.add('gui-iframe');
			/*
			 * TODO: should be moved to src() method (but fails)!!!!!
			 */
			if (src) {
				if (gui.URL.external(src, doc)) {
					var url = new gui.URL(doc, src);
					spirit.xguest = url.protocol + '//' + url.host;
					// src = this.sign ( src, doc, spirit.$instanceid );
				}
			} else {
				src = this.SRC_DEFAULT;
			}
			iframe.src = src;
			return spirit;
		}
	},
	{
		// Static .................................................................

		/**
		 * Presumably harmless iframe source. The issue here is that "about:blank"
		 * may raise security concerns for some browsers when running HTTPS setup.
		 * @type {String}
		 */
		SRC_DEFAULT: 'javascript:void(false);'
	}
);
