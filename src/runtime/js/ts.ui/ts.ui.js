gui.$mark('- parse runtime');

/**
 * Namespace object.
 * @using {gui.Client} Client
 * @using {gui.Array} guiArray
 * @using {gui.Arguments.confirmed} confirmed
 * @using {gui.Combo.chained} chained
 */
ts.ui = gui.namespace(
	'ts.ui',
	(function using(Client, guiArray, confirmed, chained) {
		/*
		 * Supports a temp ad hoc API for breakpoint callbacks.
		 * @type {Array<function>}
		 */
		var breakpointers = [];

		return {
			/**
			 * The tradeshift-ui version goes here (via Gruntfile.js)
			 * @type {string}
			 */
			version: '$$VERSION$$',

			/**
			 * Nothing is "greenfield" now. If we should ever need it, we
			 * would default to `true` and switch to `false` if and when
			 * all the tradeshift-ui CSS is loaded into the document.
			 * Note to new readers: The term "greenfield" here covers a
			 * scenario where only the JavaScript APIs are loaded into
			 * the document and the actual UI elements are rendered in
			 * a separate window (in the chrome or an embedded iframe).
			 * @type {boolean}
			 */
			greenfield: false,

			/**
			 * Is running inside the Frankenstein chrome? Issue is that Chrome (the
			 * browser) cannot investigate anything in the containing frame without
			 * throwing security exceptions *if* indeed it's not in Frankenstein,
			 * but we can at least inspect the page location href.
			 * @type {boolean}
			 */
			frankenstein: (function(path) {
				var vendorappid = /[A-Z][A-Za-z]+\.[A-Z][A-Za-z]+/;
				return !!(
					window !== top &&
					(path.includes('/app/') || path.includes('/v4/') || path.match(vendorappid))
				);
			})(window.location.pathname),

			/**
			 * Should only ever be true in the top frame (chrome).
			 * @type {boolean}
			 */
			topframe: false,

			/**
			 * Should ever only be true inside the second level app host frame.
			 * That is, NOT inside the innermost app frame or in the top frame.
			 * @type {boolean}
			 */
			subframe: false,

			/**
			 * Appframe assumed true unless explicitely denied eg. using meta tag:
			 * <meta name="ts.ui.appframe" content="false"/>
			 */
			appframe: true,

			/**
			 * Current breakpoint.
			 * TODO: This remains `null` until window is resized or what?
			 * @type {string}
			 */
			breakpoint: null,

			/**
			 * Generally use CSS transitions?
			 * @type {boolean}
			 */
			usetransitions: Client.hasTransitions,

			/**
			 * Use pointerevents? Except for IE9, we have that covered via a polyfill.
			 * @type {boolean}
			 */
			hasPointers: Client.hasPointers || !Client.isExplorer9,

			// Miscelaneous ............................................................

			/**
			 * Magic URL substring used on the Dox website
			 * (so perhaps this constant should be renamed).
			 * @type {string}
			 */
			TRADESHIFT_HOME: '/',

			// Units ...................................................................

			UNIT: 20,
			UNIT_HALF: 10,
			UNIT_QUARTER: 5,
			UNIT_DOUBLE: 40,
			UNIT_TRIPLE: 60,
			UNIT_QUADRUPLE: 80,

			// Classnames ..............................................................

			// browserhacks (synchronized to the browser)
			CLASS_ENGINE: 'ts-engine-' + Client.agent,

			// breakpoints
			CLASS_MOBILE: 'ts-mobile',
			CLASS_TABLET: 'ts-tablet',
			CLASS_DESKTOP: 'ts-desktop',
			CLASS_SELECT: 'ts-select',
			CLASS_MOBILE_ONLY: 'ts-mobile-only',
			CLASS_TABLET_ONLY: 'ts-tablet-only',
			CLASS_DESKTOP_ONLY: 'ts-desktop-only',

			// layout
			CLASS_HAS_TOPBAR: 'ts-has-topbar',
			CLASS_HAS_TOPBAR_TABS: 'ts-has-topbar-tabs',
			CLASS_HAS_NOTE: 'ts-has-note',
			CLASS_USEFLEX: 'ts-useflex',
			CLASS_NOFLEX: 'ts-noflex',
			CLASS_USETRANSITION: 'ts-usetransition',
			CLASS_NOTRANSITION: 'ts-notransition',
			CLASS_TRANSITION: 'ts-transition',

			// abstract
			CLASS_PRIMARY: 'ts-primary',
			CLASS_SECONDARY: 'ts-secondary',
			CLASS_TERTIARY: 'ts-tertiary',
			CLASS_DANGER: 'ts-danger',
			CLASS_VISIBLE: 'ts-visible',
			CLASS_HIDDEN: 'ts-hidden',
			CLASS_LOADING: 'ts-loading',
			CLASS_BLOCKING: 'ts-blocking',
			CLASS_NONBLOCKING: 'ts-nonblocking',
			CLASS_WAITING: 'ts-waiting',
			CLASS_READY: 'ts-ready',
			CLASS_BUSY: 'ts-busy',
			CLASS_OPEN: 'ts-open',
			CLASS_CLOSED: 'ts-closed',
			CLASS_OPENING: 'ts-opening',
			CLASS_CLOSING: 'ts-closing',
			CLASS_TOP: 'ts-top',
			CLASS_RIGHT: 'ts-right',
			CLASS_BOTTOM: 'ts-bottom',
			CLASS_LEFT: 'ts-left',
			CLASS_MICRO: 'ts-micro',
			CLASS_MACRO: 'ts-macro',
			CLASS_CHECKED: 'ts-checked',
			CLASS_SELECTED: 'ts-selected',
			CLASS_SUCCESS: 'ts-success',
			CLASS_WARNING: 'ts-warning',
			CLASS_ERROR: 'ts-error',
			CLASS_INFO: 'ts-info',
			CLASS_OPTIMIZED: 'ts-optimized',

			// widgets - TODO: maybe move to core-gui@tradeshift.com
			CLASS_MAIN: 'ts-main',
			CLASS_IFRAME: 'ts-iframe', // TODO: this should move into the chrome!
			CLASS_MAINFRAME: 'ts-mainframe', // TODO: this should move into the chrome!
			CLASS_TABS: 'ts-tabs',
			CLASS_COVER: 'ts-cover',
			CLASS_ASIDE: 'ts-aside',
			CLASS_DRAWER: 'ts-drawer',
			CLASS_HEADER: 'ts-header',
			CLASS_PANEL: 'ts-panel',
			CLASS_MENU: 'ts-menu',
			CLASS_BUTTON: 'ts-button',
			CLASS_BUTTONS: 'ts-buttons',
			CLASS_LINK: 'ts-link',
			CLASS_DIALOG: 'ts-dialog',
			CLASS_NOTE: 'ts-note',
			CLASS_LOADING_BAR: 'ts-loading-bar',
			CLASS_IS_LOADING: 'ts-is-loading',

			// forms - TODO: maybe move to forms-gui@tradeshift.com
			CLASS_FORM: 'ts-form',
			CLASS_PREVIEW: 'ts-preview',
			CLASS_FIELD: 'ts-field',
			CLASS_GROUP: 'ts-group',
			CLASS_TEXT: 'ts-text',
			CLASS_DATE: 'ts-date',
			CLASS_TIME: 'ts-time',
			CLASS_FAKE: 'ts-fake',
			CLASS_TEXTAREA: 'ts-textarea',
			CLASS_FIELDLABEL: 'ts-fieldlabel',
			CLASS_TEXTLABEL: 'ts-textlabel',
			CLASS_DATELABEL: 'ts-datelabel',
			CLASS_FAKELABEL: 'ts-fakelabel',
			CLASS_SWITCHLABEL: 'ts-switchlabel',
			CLASS_CUSTOMICONLABEL: 'ts-customiconlabel',
			CLASS_OPTIONS: 'ts-options',
			CLASS_OPTION: 'ts-option',
			CLASS_FOCUS: 'ts-focus',
			CLASS_FOCUS_ON: 'ts-focus-on',
			CLASS_EMPTY: 'ts-empty',
			CLASS_SWITCHBOX: 'ts-switchbox',
			CLASS_DISABLED: 'ts-disabled',
			CLASS_READONLY: 'ts-readonly',
			CLASS_REQUIRED: 'ts-required',
			CLASS_NOLOCK: 'ts-nolock',
			CLASS_HASLABEL: 'ts-haslabel',

			// background colors (deprecated!)
			CLASS_BG_LITE: 'ts-bg-lite',
			CLASS_BG_WHITE: 'ts-bg-white',
			CLASS_BG_DARK: 'ts-bg-dark',
			CLASS_BG_BLUE: 'ts-bg-blue',
			CLASS_BG_GREEN: 'ts-bg-green',
			CLASS_BG_YELLOW: 'ts-bg-yellow',
			CLASS_BG_ORANGE: 'ts-bg-orange',
			CLASS_BG_RED: 'ts-bg-red',
			CLASS_BG_PURPLE: 'ts-bg-purple',

			// amazing colors
			CLASS_BLACK: 'ts-color-black',
			CLASS_WHITE: 'ts-color-white',
			CLASS_BLUE: 'ts-color-blue',
			CLASS_GREEN: 'ts-color-green',
			CLASS_YELLOW: 'ts-color-yellow',
			CLASS_ORANGE: 'ts-color-orange',
			CLASS_RED: 'ts-color-red',
			CLASS_PURPLE: 'ts-color-purple',
			CLASS_GRAY_LIGHT: 'ts-color-gray-light',

			// Icons ...................................................................

			ICON_CLOSE: 'ts-icon-close',

			// Actions .................................................................

			// local actions
			ACTION_CLICK: 'ts-action-click',
			ACTION_CLOSE: 'ts-action-close',
			ACTION_SWITCH: 'ts-action-switch',
			ACTION_DID_LOAD: 'ts-action-did-load',
			ACTION_CHANGED: 'ts-action-changed',
			ACTION_FRAME_ONDOM: 'ts-action-frame-ondom',
			ACTION_FRAME_ONLOAD: 'ts-action-frame-onload',
			ACTION_FRAME_UNLOAD: 'ts-action-frame-unload',
			ACTION_FRAME_ONHASH: 'ts-action-frame-onhash',
			ACTION_ASIDE_WILL_OPEN: 'ts-action-aside-will-open',
			ACTION_ASIDE_DID_OPEN: 'ts-action-aside-did-open',
			ACTION_ASIDE_WILL_CLOSE: 'ts-action-aside-will-close',
			ACTION_ASIDE_DID_CLOSE: 'ts-action-aside-did-close',
			ACTION_SAFE_LINK: 'ts-action-safe-link',
			ACTION_SAFE_BUTTON: 'ts-action-safe-button',
			ACTION_SAFE_FORM: 'ts-action-safe-form',
			ACTION_PANEL_ATTACH: 'ts-action-panel-attach',
			ACTION_PANEL_DETACH: 'ts-action-panel-detach',
			ACTION_PANEL_SHOW: 'ts-action-panel-show',
			ACTION_PANEL_HIDE: 'ts-action-panel-hide',
			ACTION_PAGER_SELECT: 'ts-action-pager-select',
			ACTION_STATUSBAR_LEVEL: 'ts-action-statusbar-level',
			ACTION_HEADER_LEVEL: 'ts-action-header-level',
			ACTION_FOOTER_LEVEL: 'ts-action-footer-level',

			// postmessages
			MESSAGE_BUSY: 'ts-busy',
			MESSAGE_DONE: 'ts-done',

			// global actions
			ACTION_GLOBAL_LOAD: 'ts-action-g-load',
			ACTION_GLOBAL_LOAD_HTML: 'ts-action-g-load-html',
			ACTION_GLOBAL_LOCATION_CHANGEHREF: 'ts-action-g-location-changehref',
			ACTION_GLOBAL_LOCATION_CHANGEHASH: 'ts-action-g-location-changehash',
			ACTION_GLOBAL_MODELS_INITIALIZE: 'ts-action-g-models-initialize',
			ACTION_GLOBAL_COMPLETED: 'ts-action-g-completed',
			ACTION_GLOBAL_TERMINATE: 'ts-action-g-terminate',
			ACTION_GLOBAL_MESSAGE_UP: 'ts-action-g-message-up',
			ACTION_GLOBAL_MESSAGE_DOWN: 'ts-action-g-message-down',
			ACTION_GLOBAL_DOCUMENT_TITLE: 'ts-action-g-document-title',
			ACTION_GLOBAL_LOCALSTORAGE_SET: 'ts-action-g-localdata-set',
			ACTION_GLOBAL_LOCALSTORAGE_ERROR: 'ts-action-g-localdata-error',
			ACTION_GLOBAL_ANALYTICS_READY: 'ts-action-g-analytics-ready',
			ACTION_GLOBAL_ANALYTICS_SETUP: 'ts-action-g-analytics-setup',
			ACTION_GLOBAL_ANALYTICS_TRACK: 'ts-action-g-analytics-track',

			// Broadcasts ..............................................................

			// local broadcasts
			BROADCAST_COMPLETED: 'ts-broadcast-completed',
			// BROADCAST_TERMINATE: 'ts-broadcast-terminate',
			BROADCAST_DIALOG_WILL_OPEN: 'ts-broadcast-dialog-will-open',
			BROADCAST_DIALOG_GO_OPEN: 'ts-broadcast-dialog-go-open',
			BROADCAST_DIALOG_DID_OPEN: 'ts-broadcast-dialog-did-open',
			BROADCAST_DIALOG_WILL_CLOSE: 'ts-broadcast-dialog-will-close',
			BROADCAST_DIALOG_DID_CLOSE: 'ts-broadcast-dialog-did-close',
			BROADCAST_MODAL_WILL_OPEN: 'ts-broadcast-modal-will-open',
			BROADCAST_MODAL_DID_OPEN: 'ts-broadcast-modal-did-open',
			BROADCAST_MODAL_WILL_CLOSE: 'ts-broadcast-modal-will-close',
			BROADCAST_MODAL_DID_CLOSE: 'ts-broadcast-modal-did-close',
			BROADCAST_ATTENTION_MOVE: 'ts-broadcast-attention-move',
			BROADCAST_PANEL_SYNC_MENU: 'ts-broadcast-panel-sync-to-menu',

			// global broadcasts
			BROADCAST_GLOBAL_MODEL_UPDATE: 'ts-broadcast-g-model-update',
			// BROADCAST_GLOBAL_STATUS_BUSY_BLOCKING: 'ts-broadcast-g-status-busy-blocking',
			// BROADCAST_GLOBAL_STATUS_DONE_BLOCKING: 'ts-broadcast-g-status-done-blocking',
			// BROADCAST_GLOBAL_STATUS_BUSY: 'ts-broadcast-g-status-busy',
			// BROADCAST_GLOBAL_STATUS_DONE: 'ts-broadcast-g-status-done',
			BROADCAST_GLOBAL_ALL_BUSY: 'ts-broadcast-g-all-busy',
			BROADCAST_GLOBAL_ALL_DONE: 'ts-broadcast-g-all-done',
			BROADCAST_GLOBAL_DIALOGS_WILL_ON: 'ts-broadcast-g-dialogs-will-on',
			BROADCAST_GLOBAL_DIALOGS_DID_OFF: 'ts-broadcast-g-dialogs-did-off',
			BROADCAST_GLOBAL_DIALOGS_WILL_BLOCK: 'ts-broadcast-g-dialogs-will-block',
			BROADCAST_GLOBAL_DIALOGS_DID_UNBLOCK: 'ts-broadcast-g-dialogs-did-unblock',
			BROADCAST_GLOBAL_ASIDES_WILL_ON: 'ts-broadcast-g-asides-will-on',
			BROADCAST_GLOBAL_ASIDES_DID_ON: 'ts-broadcast-g-asides-did-on',
			BROADCAST_GLOBAL_ASIDES_WILL_OFF: 'ts-broadcast-g-asides-will-off',
			BROADCAST_GLOBAL_ASIDES_DID_OFF: 'ts-broadcast-g-asides-did-off',
			BROADCAST_GLOBAL_ASIDES_DO_CLOSE: 'ts-broadcast-g-asides-do-close',
			BROADCAST_GLOBAL_PROGRESSBAR: 'ts-broadcast-g-progressbar',
			// BROADCAST_GLOBAL_APP_LOADING: 'ts-broadcast-g-app-loading',
			// BROADCAST_GLOBAL_APP_ABORTED: 'ts-broadcast-g-app-aborted',
			// BROADCAST_GLOBAL_APP_COMPLETE: 'ts-broadcast-g-app-complete',
			BROADCAST_GLOBAL_TOPBAR_UPDATE: 'ts-broadcast-g-topbar-update',
			BROADCAST_GLOBAL_TOPBAR_READY: 'ts-broadcast-g-topbar-ready',
			BROADCAST_GLOBAL_TOPBAR_UPDATE_DEFAULT_TITLE: 'ts-broadcast-g-topbar-update-default-title',
			BROADCAST_GLOBAL_USER_WILL_EXIT: 'ts-broadcast-g-user-will-exit',
			BROADCAST_GLOBAL_COVER_TOUCH: 'ts-broadcast-global-cover-touch',
			BROADCAST_GLOBAL_COVER_HOVER: 'ts-broadcast-global-cover-hover',
			BROADCAST_GLOBAL_MENU_OPEN: 'ts-broadcast-g-menu-open',
			BROADCAST_GLOBAL_MENU_CLOSE: 'ts-broadcast-g-menu-close',
			BROADCAST_TO_CHROME: 'Tradeshift.Chrome',
			BROADCAST_CHROME_MENU_OPEN: 'ts-broadcast-chrome-menu-open',
			BROADCAST_CHROME_MENU_CLOSE: 'ts-broadcast-chrome-menu-close',

			// Events ..................................................................

			/*
			 * TODO: These are now used in SideBars and Modals and should be renamed
			 */
			EVENT_ASIDE_WILL_OPEN: 'ts-open',
			EVENT_ASIDE_DID_OPEN: 'ts-opened',
			EVENT_ASIDE_WILL_CLOSE: 'ts-close',
			EVENT_ASIDE_DID_CLOSE: 'ts-closed',
			EVENT_FOCUS: 'ts-focus',
			EVENT_BLUR: 'ts-blur',

			// Ticks ...................................................................

			TICK_SELECT_CHECK: 'ts-tick-select-check',

			// Lifecycle ...............................................................

			LIFE_STATUS_BUSY: 'ts-life-status-busy',
			LIFE_STATUS_DONE: 'ts-life-status-done',

			// Animations ..............................................................

			TRANSITION_NOW: 100,
			TRANSITION_FAST: 200,
			TRANSITION_SLOW: 600,
			TRANSITION_DELAY: 30,
			TIMING_SLOWDOWN: 'cubic-bezier(0,1,0,1)',
			TIMING_SPEEDUP: 'cubic-bezier(1,0,1,0)',

			// Timeouts ................................................................

			TIMEOUT_UNFREEZE: 50,

			// Z-indexes ...............................................................

			ZINDEX_ASIDE: 2000, // duplicates @ts-zindex-aside in ts-variables.less

			// Methods .................................................................

			/**
			 * Facade `gui.get`: Lookup first spirit instance for argument(s).
			 * @param {String|Element} arg
			 * @param @optional {function} callback
			 * @param @optional {object} thisp
			 * @return {gui.Spirit|gui.Then}
			 */
			get: function() {
				return gui.get.apply(gui, arguments);
			},

			/**
			 * Facade `gui.init`: Do something before the spirits get
			 * here. Or if that's already too late, just do it now.
			 * @param {function} action
			 * @param {Object=} opt_thisp
			 * @returns {Namespace}
			 */
			init: chained(function(action, opt_thisp) {
				gui.init(action, opt_thisp);
			}),

			/**
			 * Facade `gui.ready`: Do something when everything is spiritualized
			 * (after `DOMContentLoaded`). Or if that's already too late, just do it.
			 * @param {function} action
			 * @param @optional {object} opt_thisp
			 * @returns {Namespace}
			 */
			ready: chained(function(action, opt_thisp) {
				gui.ready(action, opt_thisp);
			}),

			/**
			 * Open the main navigation menu (up in the chrome somewhere).
			 * @returns {Namespace}
			 */
			openMenu: chained(function() {
				gui.Broadcast.dispatchGlobal(this.BROADCAST_GLOBAL_MENU_OPEN);
				if (ts.app && ts.app.broadcast) {
					ts.app.broadcast(this.BROADCAST_TO_CHROME, this.BROADCAST_CHROME_MENU_OPEN);
				}
			}),

			/**
			 * Close the main navigation menu.
			 * @returns {Namespace}
			 */
			closeMenu: chained(function() {
				gui.Broadcast.dispatchGlobal(this.BROADCAST_GLOBAL_MENU_CLOSE);
				if (ts.app && ts.app.broadcast) {
					ts.app.broadcast(this.BROADCAST_TO_CHROME, this.BROADCAST_CHROME_MENU_CLOSE);
				}
			}),

			/**
			 * @deprecated (but still used in the Client-Docs website, so don't kill).
			 * Load URL as new app. This implies that we create a new iframe instead
			 * of reusing the old one, preventing a temporary flash-of-no-content.
			 * We also get history support (via browsers back and forward buttons).
			 * TODO(jmo@): Separate "error class" for extra long error messages!
			 * @param {string} href The href must be formatted as an app URL
			 * @param @optional {string} target TODO(jmo@): support this argument
			 */
			load: function(href, opt_target) {
				var url = new gui.URL(document, href);
				this.ready(function spiritualized() {
					ts.ui.get('html').action.dispatchGlobal(ts.ui.ACTION_GLOBAL_LOAD, {
						href: url.href,
						target: opt_target
					});
				});
			},

			/**
			 * Reflex everything (to tighten up any JS based layout).
			 */
			reflex: chained(function() {
				ts.ui.get(document.documentElement).reflex();
			}),

			/**
			 * Is mobile breakpoint?
			 * @returns {boolean}
			 */
			isMobilePoint: function() {
				return this._getlayout().isMobilePoint();
			},

			/**
			 * Is tablet breakpoint?
			 * @returns {boolean}
			 */
			isTabletPoint: function() {
				return this._getlayout().isTabletPoint();
			},

			/**
			 * Is desktop breakpoint?
			 * @returns {boolean}
			 */
			isDesktopPoint: function() {
				return this._getlayout().isDesktopPoint();
			},

			/**
			 * Add breakpoint listener.
			 * @param {function} callback Two args: newpoint + oldpoint
			 */
			addBreakPointListener: function(callback) {
				console.error('addBreakPointListener is deprecated');
				breakpointers.push(callback);
			},

			/**
			 * Remove breakpoint listener.
			 * @param {function} callback
			 */
			removeBreakPointListener: function(callback) {
				gui.Array.remove(breakpointers, breakpointers.indexOf(callback));
			},

			/**
			 * Handle model changes.
			 * // TODO: on breakpoint, also dispatch custom event on document node.
			 * @param {Array<edb.Change>} changes
			 */
			onchange: function(changes) {
				changes.forEach(function(c) {
					if (c.object instanceof ts.ui.LayoutModel) {
						if (c.name === 'breakpoint') {
							ts.ui.breakpoint = c.newValue;
							breakpointers.forEach(function(callback) {
								callback(c.newValue, c.oldValue);
							});
						}
					}
				});
			},

			/**
			 * Don't materialize and spiritualize during given operation.
			 * If the operation is async, use `suspend()` and `resume()`.
			 * @param {funtion} [operation] Assumed synchronous!
			 * @param {Object} [thisp]
			 */
			suspend: function(operation, thisp) {
				if (arguments.length) {
					return gui.suspend.apply(gui, arguments);
				} else {
					gui.suspend();
				}
			},

			/**
			 * Resume spiritualization and materialization.
			 */
			resume: function() {
				gui.resume();
			},

			/**
			 * Stringify stuff to be used as HTML attribute values.
			 * @param {object} data
			 * @returns {String}
			 */
			encode: function(data) {
				return edbml.Att.$encode(data);
			},

			// Private .................................................................

			/**
			 * Get that layout model.
			 * @returns {ts.ui.LayoutModel}
			 */
			_getlayout: function() {
				var model = ts.ui.LayoutModel.output.get();
				if (!model) {
					console.error(this + ' is not initialized');
				}
				return model;
			}
		};
	})(gui.Client, gui.Array, gui.Arguments.confirmed, gui.Combo.chained)
);

/**
 * @deprecated
 * Match method names to some background
 * colors for various coloring purposes.
 * @type {Map<string, string>}
 */
ts.ui.BACKGROUND_COLORS = {
	dark: ts.ui.CLASS_BG_DARK,
	lite: ts.ui.CLASS_BG_LITE,
	white: ts.ui.CLASS_BG_WHITE,
	blue: ts.ui.CLASS_BG_BLUE,
	green: ts.ui.CLASS_BG_GREEN,
	purple: ts.ui.CLASS_BG_PURPLE,
	yellow: ts.ui.CLASS_BG_YELLOW,
	orange: ts.ui.CLASS_BG_ORANGE,
	red: ts.ui.CLASS_BG_RED
};

/**
 * @deprecated
 * Match method names to some colors.
 * @type {Map<string, string>}
 */
ts.ui.COLORS = {
	black: ts.ui.CLASS_BLACK,
	white: ts.ui.CLASS_WHITE,
	blue: ts.ui.CLASS_BLUE,
	green: ts.ui.CLASS_GREEN,
	purple: ts.ui.CLASS_PURPLE,
	yellow: ts.ui.CLASS_YELLOW,
	orange: ts.ui.CLASS_ORANGE,
	red: ts.ui.CLASS_RED,
	'gray-light': ts.ui.CLASS_GRAY_LIGHT
};

/**
 * Match icon names to icon-font characters
 * @TODO This will be obsolete when we ascend to SVG icons
 * @type {Map<string, string>}
 */
ts.ui.ICONS = {
	'ts-icon-logo-trade': 'K',
	'ts-icon-logo-shift': 'L',
	'ts-icon-logo-t1': 'M',
	'ts-icon-logo-t2': 'N',
	'ts-icon-discovery': 'E',
	'ts-icon-activity': 'f',
	'ts-icon-todo': 'q',
	'ts-icon-network': 'G',
	'ts-icon-createdocument': 'P',
	'ts-icon-alldocuments': 'j',
	'ts-icon-document': ';',
	'ts-icon-sales': 'X',
	'ts-icon-purchases': '$',
	'ts-icon-cart': '$',
	'ts-icon-drafts': 'F',
	'ts-icon-apps': 'a',
	'ts-icon-usersettings': 'U',
	'ts-icon-settings': 'y',
	'ts-icon-companyprofile': 'H',
	'ts-icon-logout': 'Q',
	'ts-icon-support': '?',
	'ts-icon-checked': '3',
	'ts-icon-accept': '3',
	'ts-icon-done': '3',
	'ts-icon-checked-alt': '2',
	'ts-icon-remove': 'D',
	'ts-icon-add': '&',
	'ts-icon-close': '*',
	'ts-icon-location': '@',
	'ts-icon-addfilter': 'k',
	'ts-icon-followed': 'S',
	'ts-icon-unfollowed': '5',
	'ts-icon-search': 's',
	'ts-icon-statuschange': '1',
	'ts-icon-edit': 'p',
	'ts-icon-rating': 'r',
	'ts-icon-share': 'R',
	'ts-icon-industry': 'z',
	'ts-icon-showpicker': '6',
	'ts-icon-warning': '!',
	'ts-icon-timer': 't',
	'ts-icon-comment': 'w',
	'ts-icon-more': '+',
	'ts-icon-users': 'g',
	'ts-icon-ownership': '§',
	'ts-icon-companysize': 'g',
	'ts-icon-view': 'I',
	'ts-icon-reject': 'd',
	'ts-icon-dispute': '\\',
	'ts-icon-menuswitch': 'l',
	'ts-icon-delete': '#',
	'ts-icon-cancel': 'd',
	'ts-icon-info': 'i',
	'ts-icon-forums': 'i',
	'ts-icon-addfield': ',',
	'ts-icon-fileaccess': '/',
	'ts-icon-error': '!',
	'ts-icon-appactivate': '&',
	'ts-icon-appactive': '3',
	'ts-icon-fileattach': 'A',
	'ts-icon-reset': 'n',
	'ts-icon-send': 'm',
	'ts-icon-save': 'e',
	'ts-icon-proceed': '>',
	'ts-icon-back': '<',
	'ts-icon-download': 'B',
	'ts-icon-broadcastmessage': 'b',
	'ts-icon-insertfrominventory': '|',
	'ts-icon-triangleright': '6',
	'ts-icon-triangleleft': '8',
	'ts-icon-triangleup': '9',
	'ts-icon-triangledown': '7',
	'ts-icon-arrowright': '>',
	'ts-icon-arrowleft': '<',
	'ts-icon-arrowup': 'u',
	'ts-icon-arrowdown': 'v',
	'ts-icon-preview': 'o',
	'ts-icon-locked': 'V',
	'ts-icon-unlocked': 'W',
	'ts-icon-next': '>',
	'ts-icon-approve': '3',
	'ts-icon-code': 'C',
	'ts-icon-halt': 'h',
	'ts-icon-pay': '_',
	'ts-icon-other': 'O',
	'ts-icon-myapps': 'Y',
	'ts-icon-companyevent': 'c',
	'ts-icon-split': '%',
	'ts-icon-split-alt': '÷',
	'ts-icon-merge': 'J',
	'ts-icon-associated': '=',
	'ts-icon-radio': '{',
	'ts-icon-radioon': ':',
	'ts-icon-checkbox': "'",
	'ts-icon-checkboxon': '"',
	'ts-icon-written-request': '(',
	'ts-icon-categories': ')',
	'ts-icon-favorites': '≥',
	'ts-icon-heart': '≥',
	'ts-icon-preferred': '∫',
	'ts-icon-pin': '∫',
	'ts-icon-previously-requested': '∞',
	'ts-icon-archive': '÷',
	'ts-icon-add-to-archive': '∅',
	'ts-icon-calendar': '©',
	'ts-icon-select': '}'
};

/**
 * Observe that LayoutModel.
 */
ts.ui.ready(function addobserver() {
	var layout = ts.ui.LayoutModel.output.get();
	ts.ui.breakpoint = layout.breakpoint;
	layout.addObserver(ts.ui);
});
