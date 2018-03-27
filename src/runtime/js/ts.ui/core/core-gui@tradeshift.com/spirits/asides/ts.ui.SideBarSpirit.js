/**
 * Spirit of the SideBar (formerly known as the "Drawer").
 * @see @deprecated {ts.ui.DrawerSpirit}
 * @extends {ts.ui.SideShowSpirit}
 * @using {gui.Combo.chained} chained
 * @using {gui.Type} Type
 * @using {gui.Client} Client
 * @using {gui.Object} GuiObject
 * @using {ts.ui.BACKGROUND_COLORS} Colors
 */
ts.ui.SideBarSpirit = (function using(chained, Type, Client, GuiObject, Colors) {
	// consuming all actions from nested asides
	var willopen = ts.ui.ACTION_ASIDE_WILL_OPEN,
		didopen = ts.ui.ACTION_ASIDE_DID_OPEN,
		willclose = ts.ui.ACTION_ASIDE_WILL_CLOSE,
		didclose = ts.ui.ACTION_ASIDE_DID_CLOSE;

	return ts.ui.SideShowSpirit.extend(
		{
			/**
			 * Open by default.
			 * @type {boolean}
			 */
			isOpen: true,

			/**
			 * Automatically close the SideBar in mobile breakpoint?
			 * Note that the SideBar must then be *manually* opened.
			 * @type {boolean}
			 */
			autoclose: {
				getter: function() {
					return this._autoclose;
				},
				setter: function(autoclose) {
					if (Type.isBoolean(Type.cast(autoclose))) {
						// no weird moustache syntax
						this.css.shift(autoclose, 'ts-autoclose');
						this._autoclose = !!autoclose;
						if (this.life.ready) {
							// changed post init
							if (this._autoclose) {
								if (ts.ui.isMobilePoint()) {
									this._breakpoint();
								}
							} else {
								this._closebutton(false);
								this.isOpen = true;
								this.reflex();
							}
						}
					}
				}
			},

			/**
			 * Setup to consume actions from nested Asides.
			 */
			onconfigure: function() {
				this.super.onconfigure();
				this.action.add([willopen, didopen, willclose, didclose]);
			},

			/**
			 * Add assistant classnames and fix the layout.
			 */
			onattach: function() {
				this.super.onattach();
				this.action.dispatch('ts-action-attach');
				this._layoutmain(true);
				if (ts.ui.isMobilePoint()) {
					this._breakpoint();
				} else {
					this._reflex();
				}
			},

			/**
			 * Setup the stuff.
			 */
			onenter: function() {
				this.super.onenter();
				this._breakpointwatch();
				this.css.shift(this._autoclose, 'ts-autoclose');
			},

			/**
			 * Remove assistant classnames.
			 */
			ondetach: function() {
				this.super.ondetach();
				this._layoutmain(false);
			},

			/**
			 * Give'm a second to move the SideBar into it's designated
			 * position (immediately before or after the '.ts-main' element)
			 * if for some reason the portal server didn't place it there.
			 */
			onready: function() {
				this.super.onready();
				this.input.connect(ts.ui.TopBarModel);
				this.tick.time(function() {
					this._confirmposition();
				}, 1000);
			},

			/**
			 * Handle input. Watching that TopBar.
			 * @param {gui.Input} input
			 */
			oninput: function(i) {
				this.super.oninput(i);
				if (i.type === ts.ui.TopBarModel) {
					i.data.addObserver(this);
				}
			},

			/**
			 * Handle changes. Reflex the layout when TopBar toggles
			 * and hope this fixes the height measurement in Safari.
			 * UPDATE: It worked - now do this with a simple broadcast!!!!!!!!!!!!!!!!!!
			 * @param {Array<edb.Change>} changes
			 */
			onchange: function(changes) {
				this.super.onchange(changes);
				changes.forEach(function(change) {
					if (ts.ui.TopBarModel.is(change.object)) {
						if (change.name === 'hascontent') {
							this._reflex();
						}
					}
				}, this);
			},

			/**
			 * Consume all nested aside actions
			 * so as not to trigger the cover.
			 * @param {gui.Action} a
			 */
			onaction: function(a) {
				this.super.onaction(a);
				switch (a.type) {
					case willopen:
						this._fitaside(a.target, this.dom.qall('.ts-footer', ts.ui.AsideFooterSpirit));
						a.consume();
						break;
					case didopen:
					case willclose:
					case didclose:
						a.consume();
						break;
				}
			},

			/**
			 * Cleanup (using a temporary API that should be refactored).
			 */
			ondestruct: function() {
				this.super.ondestruct();
				ts.ui.removeBreakPointListener(this);
			},

			// Privileged ............................................................

			/**
			 * Show the SideBar (now that it's hidden in mobile view).
			 */
			$onopen: function() {
				this.css.add(ts.ui.CLASS_OPENING);
				this._reflex();
				this.tick.time(function slide() {
					this.css.add(ts.ui.CLASS_OPEN);
					this.doorman.didopen();
				});
			},

			/**
			 * Don't show the SideBar.
			 */
			$onclose: function() {
				this.css.remove(ts.ui.CLASS_OPEN);
				this.tick.time(function undisplay() {
					this.css.remove(ts.ui.CLASS_OPENING);
					this.doorman.didclose();
				}, ts.ui.TRANSITION_FAST);
			},

			// Private ...............................................................

			/**
			 * Automatically close the SideBar in mobile breakpoint?
			 * @type {boolean}
			 */
			_autoclose: true,

			/**
			 * This classname has to do with flipping, it's a future project.
			 */
			_fixappearance: function() {
				this.super._fixappearance();
				var has3D = gui.Client.has3D;
				this.css.shift(has3D, 'ts-3d').shift(!has3D, 'ts-2d');
			},

			/**
			 * Add/remove classnames on the HTML element so we can style the MAIN.
			 * TODO: This should probably all be maintained somewhat more modelled...
			 * @param {boolean} attaching This is `false' when SideBar gets removed.
			 */
			_layoutmain: function(attaching) {
				var layout = this.guilayout;
				if (layout.outsideMain()) {
					var local1 = 'ts-sidebar-first',
						local2 = 'ts-sidebar-last',
						global2 = 'ts-has-sidebar-first',
						global3 = 'ts-has-sidebar-last';
					if (layout.beforeMain()) {
						this.css.shift(attaching, local1);
						layout.shiftGlobal(attaching, global2);
					} else {
						this.css.shift(attaching, local2);
						layout.shiftGlobal(attaching, global3);
					}
				}
			},

			/**
			 * Watch for breakpoint changes (using some
			 * temporary API that should be refactored).
			 */
			_breakpointwatch: function() {
				ts.ui.addBreakPointListener(
					function() {
						this._breakpoint();
					}.bind(this)
				);
			},

			/**
			 * Collapse the SideBar on mobile breakpoint.
			 * Setup to avoid CSS transition on collapse.
			 * @param {boolean} go
			 */
			_breakpoint: function() {
				var go = ts.ui.isMobilePoint();
				if (this._autoclose) {
					this._closebutton(go);
					if (go) {
						if (this.isOpen) {
							this.close();
							this.isOpen = false;
						}
					} else {
						if (!this.isOpen) {
							this.isOpen = true;
							this.guilayout.flexGlobal();
						}
					}
				}
			},

			/**
			 * Fit nested aside inside the panel (footer scenario).
			 * @param {ts.ui.AsideSpirit} aside
			 * @param {Array<ts.ui.AsideFooterSpirit>} footers List of bonus footers
			 */
			_fitaside: function(aside, footers) {
				if (footers.length) {
					aside.css.bottom = footers.reduce(function(totalheight, footer) {
						return totalheight + footer.box.height;
					}, 0);
				}
			}
		},
		{
			// Xstatic ..............................................................

			/**
			 * List of members that should inherit any assigned background color.
			 * In the SideBar, all members get the same color (unless explicitly
			 * given a bg-color classname in the HTML).
			 * @type {Array<string>}
			 */
			$bgmembers: ['.ts-header', '.ts-tabbar', '.ts-panel', '.ts-footer']
		}
	);
})(gui.Combo.chained, gui.Type, gui.Client, gui.Object, ts.ui.BACKGROUND_COLORS);
