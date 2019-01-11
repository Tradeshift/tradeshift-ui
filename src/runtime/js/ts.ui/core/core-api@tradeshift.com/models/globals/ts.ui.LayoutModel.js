/**
 * Global layout model.
 * @extends {ts.ui.GlobalModel}
 */
ts.ui.LayoutModel = ts.ui.Model.extend(
	{
		/**
		 * Friendly name.
		 * @type {string}
		 */
		item: 'layout',

		/**
		 * True until first app loaded and shown.
		 * @type {boolean}
		 */
		booting: true,

		/**
		 * Current breakpoint. Matches mobile|tablet|desktop.
		 * @type {string}
		 */
		breakpoint: null,

		/**
		 * Derived breakponts: Current breakpoint and everything below.
		 * @type {Array<string>}
		 */
		breakpoints: null,

		/**
		 * Menu is open?
		 * TODO(jmo@): We are currently not maintaining this boolean right.
		 * @type {boolean}
		 */
		menuopen: false,

		/**
		 * SideBar is open? This information is relevant for the mobile breakpoint.
		 * @type {boolean}
		 */
		sidebaropen: false,

		/**
		 * Someone is busy doing something that blocks the UI?
		 * TODO(jmo@): We are currently not maintaining this boolean right.
		 * @see {ts.ui.StatusPlugin}
		 * @type {boolean}
		 */
		blocking: false,

		/**
		 * Tracking open asides by `$instanceid` so we can count them.
		 * @type {Array<string>}
		 */
		asides: edb.Array, // TODO: ts.ui.Collection fails for some reason

		/**
		 * Tracking open dialogs by `$instanceid` so we can count them.
		 * TODO(jmo@): We are currently not maintaining this collection right.
		 * @type {Array<string>}
		 */
		dialogs: edb.Array, // TODO: ts.ui.Collection fails for some reason

		/**
		 * Tracking focused spirits by `$instanceid` so we can restore focus.
		 * @type {Array<string>}
		 */
		attention: edb.Array, // TODO: ts.ui.Collection (but focus would break)

		/**
		 * Instantiate collections.
		 */
		onconstruct: function() {
			this.super.onconstruct();
			this.asides = [];
			this.dialogs = [];
			this.attention = [];
		},

		/**
		 * Is mobile breakpoint?
		 * @returns {boolean}
		 */
		isMobilePoint: function() {
			return this.breakpoint === ts.ui.LayoutModel.BREAKPOINT_MOBILE;
		},

		/**
		 * Is tablet breakpoint?
		 * @returns {boolean}
		 */
		isTabletPoint: function() {
			return this.breakpoint === ts.ui.LayoutModel.BREAKPOINT_TABLET;
		},

		/**
		 * Is desktop breakpoint?
		 * @returns {boolean}
		 */
		isDesktopPoint: function() {
			return this.breakpoint === ts.ui.LayoutModel.BREAKPOINT_DESKTOP;
		}
	},
	{
		// Static .................................................................

		BREAKPOINTS: { 1270: 'desktop', 650: 'tablet', 0: 'mobile' },
		BREAKPOINT_MOBILE: 'mobile', // something the size of a phone
		BREAKPOINT_TABLET: 'tablet', // something the size of a tablet
		BREAKPOINT_DESKTOP: 'desktop' // something the size of a table
	}
);
