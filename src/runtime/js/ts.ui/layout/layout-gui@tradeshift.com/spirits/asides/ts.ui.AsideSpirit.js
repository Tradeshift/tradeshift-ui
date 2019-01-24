/**
 * Spirit of the aside.
 * @extends {ts.ui.SideShowSpirit}
 * @using {gui.Combo#chained} chained
 * @using {gui.Arguments#confirmed} confirmed
 * @using {gui.Client} Client
 * @using {function} notontouch Setup to ignore focus stuff on touch device
 * @using {ts.ui.LayoutModel} LayoutModel
 */
ts.ui.AsideSpirit = (function using(chained, confirmed, Client, LayoutModel, notontouch) {
	// actions and broadcasts (for behind-the-scenes implementation)
	var willopen = ts.ui.ACTION_ASIDE_WILL_OPEN,
		didopen = ts.ui.ACTION_ASIDE_DID_OPEN,
		willclose = ts.ui.ACTION_ASIDE_WILL_CLOSE,
		didclose = ts.ui.ACTION_ASIDE_DID_CLOSE,
		doclose = ts.ui.BROADCAST_GLOBAL_ASIDES_DO_CLOSE,
		synctomenu = ts.ui.BROADCAST_PANEL_SYNC_MENU;

	// classnames
	var classopening = ts.ui.CLASS_OPENING,
		classopen = ts.ui.CLASS_OPEN,
		classclosing = ts.ui.CLASS_CLOSING,
		classclosed = ts.ui.CLASS_CLOSED;

	return ts.ui.SideShowSpirit.extend(
		{
			/**
			 * Attempt to focus something when the thing opens?
			 * TODO: Consider how Drawers should act in static (non-mobile) layout...
			 * @type {boolean}
			 */
			autofocus: true,

			/**
			 * Configure classnames and optional model.
			 */
			onconfigure: function() {
				this.super.onconfigure();
				if (this._ismodelled()) {
					this._model.addObserver(this);
					this.broadcast.add(synctomenu);
					this.autofocus = this._model.autofocus;
					this.script.load(ts.ui.AsideSpirit.edbml);
					this.script.input(this._model);
					// this should happen on EDBML render, but it doesn't :/
					this.dom.q('.ts-panel', ts.ui.PanelSpirit).exorcise();
				}
				this._position(100);
				this.dom.hide();
			},

			/**
			 * Check for the footer only once, knowing
			 * that Angular might well insert it later.
			 */
			onready: function() {
				this.super.onready();
				if (this.dom.q('this > .ts-footer')) {
					this.css.add('ts-hasfooter');
				}
			},

			/**
			 * Handle action.
			 * @param {gui.Action} a
			 */
			onaction: function(a) {
				this.super.onaction(a);
				switch (a.type) {
					case ts.ui.ACTION_CLOSE:
						if (this.isOpen) {
							this.open(false);
						}
						a.consume();
						break;
				}
			},

			/**
			 * Handle broadcast.
			 * @param {gui.Broadcast} b
			 */
			onbroadcast: function(b) {
				this.super.onbroadcast(b);
				switch (b.type) {
					case synctomenu:
						this._maybesynctomenu(b.data.menuid, b.data.offset);
						break;
					case doclose:
						if (!this._isSideBarAside()) {
							this.close();
						}
						break;
				}
			},

			/**
			 * Some MenuModel has requested a panel scroll operation.
			 * If our AsideModel contains that menu, we can do that.
			 * @param {ts.ui.Collection} items
			 * @param {string} instanceid
			 */
			_maybesynctomenu: function(menuid, offset) {
				if (
					this._model.items.some(function(item) {
						return item.$instanceid === menuid;
					})
				) {
					this.dom.q('.ts-panel').scrollTop = offset;
				}
			},

			/**
			 * Handle key.
			 * TODO (jmo@): move elsewhere and broadcast
			 * doclose
			 */
			onkey: function(k) {
				this.super.onkey(k);
				/*
				 * TODO(jmo@): Consider whether or not this is
				 * applicable to asides nested in drawers...
				 */
				if (k.down && k.type === 'Esc') {
					this.open(false);
				}
			},

			/**
			 * Handle (observed model) changes.
			 * @param {Array<edb.Change>} changes
			 */
			onchange: function(changes) {
				this.super.onchange(changes);
				if (!this.$destructed) {
					var layout = LayoutModel.output.get();
					var asides = layout.asides;
					var id = this.$instanceid;
					changes.forEach(function(c) {
						switch (c.object) {
							case asides:
								var klass = ts.ui.CLASS_SECONDARY;
								var stacked = this.css.contains(klass);
								this._index = asides.indexOf(id);
								var x = asides.length - this._index - 1;
								if (x > 0) {
									if (!stacked) {
										this._stack(true);
									}
								} else {
									if (stacked) {
										this._stack(false);
									}
								}
								this.css.shift(x > 0, klass);
								break;
							case this._model:
								this._onmodelchange(c.name, c.newValue);
								break;
						}
					}, this);
				}
			},

			/**
			 * Make sure the cover is removed if someone
			 * nukes the Aside without closing it first.
			 */
			ondetach: function() {
				this.super.ondetach();
				if (this._isreallyopen) {
					this._updateworld(willclose);
					this._updateworld(didclose);
				}
			},

			/**
			 * Remove observers on destruct: TODO: automate this step!
			 */
			ondestruct: function() {
				this.super.ondestruct();
				if (this._ismodelled()) {
					this._model.removeObserver(this);
				}
			},

			/**
			 * Focus something.
			 */
			focus: notontouch(function() {
				this._focusbest();
			}),

			// Private .................................................................

			/**
			 * Optional model.
			 * @type {ts.ui.AsideModel}
			 */
			_model: null,

			/**
			 * Z stack index.
			 * @type {number}
			 */
			_index: -1,

			/**
			 * Z stack offset.
			 * @type {number}
			 */
			_offset: 0,

			/**
			 * Offset width.
			 * @type {number}
			 */
			_width: 0,

			/**
			 * A boolean that remains flipped until the
			 * Aside is fully closed (and done animating).
			 * @type {boolean}
			 */
			_isreallyopen: false,

			/**
			 * Postponing 'onopen' until some event has occured? This setup
			 * relates to a performance optimization of the SELECT menus.
			 * @type {boolean}
			 */
			_suspendopen: false,

			/**
			 * This is just a hack for now to delay initialization of the DOM until
			 * after angular is done with the aside. This depends on being called
			 * inside of a user event handler. Because implicitly, angular is done
			 * with the element at that point in time. This is very fragile.
			 * TODO: This should be replaced with a proper Angular integration, that
			 * allows us to initialize elements after Angular has completed compilation
			 * and linking all other directives. Note that this requires us to figure
			 * out *when exactly that happens* and it is not clear, if that's possible.
			 * @type {boolean}
			 */
			_hackInitialized: false,

			/**
			 * Is this Aside within a SideBar?
			 * @returns {boolean}
			 */
			_isSideBarAside: function() {
				return !!this.dom.parent(ts.ui.SideBarSpirit);
			},

			/**
			 * Stack the Aside.
			 * @param {boolean} stack
			 */
			_stack: function(stack) {
				this._slideopen(!stack);
			},

			/**
			 * Fix an occasional collision with the Angular compiler.
			 */
			_delayedAngularInitialization: function() {
				if (!this._hackInitialized) {
					this._hackInitialized = true;
					this._closebutton();
				}
			},

			/**
			 * Open.
			 * TODO: Validate that we are not opening inside .ts-main
			 * @param {boolean} animated (not supported just yet)
			 */
			$onopen: function(animated) {
				this._delayedAngularInitialization();
				this._trapattention();
				this._willopen();
				this.super.$onopen();
			},

			/**
			 * Close.
			 * @param {boolean} animated (not supported)
			 */
			$onclose: function(animated) {
				this._willclose();
				this.super.$onclose();
			},

			/**
			 * The {ts.ui.AsideModel} changed something.
			 * @param {string} name
			 * @param {object} value
			 */
			_onmodelchange: function(name, value) {
				switch (name) {
					case 'gofocused':
						this.focus();
						break;
					case 'suspendopen':
						if (this._suspendopen && value === false) {
							this._suspendopen = false;
							this._didopen();
						}
						break;
				}
			},

			/**
			 * CSS transition ended.
			 */
			_ontransitionend: function() {
				if (this.isOpen) {
					this.css.remove(classopening).add(classopen);
					this._didopen();
				} else {
					this.css.remove(classclosing).add(classclosed);
					this._didclose();
				}
			},

			/**
			 * Setup to cycle TAB navigation inside the panel.
			 */
			_trapattention: function() {
				if (!this.attention.trapping) {
					this.attention.trap(this.dom.q('.ts-panel'));
				}
			},

			/**
			 * About to open.
			 */
			_willopen: function() {
				var index = 0;
				this._confirmposition();
				this._isreallyopen = true;
				this.dom.show();
				this._head().reflex();
				this.css.add(classopening);
				this._updateworld(willopen);
				this._register(true);
				if ((index = this._zindex())) {
					this.css.zIndex = index;
				}
				if (this._ismodelled()) {
					this._model.status = 'onopen';
				}
			},

			/**
			 * Fully opened.
			 */
			_didopen: function() {
				/*
				 * The model (if exists) is able to halt the execution of 'onopen'
				 * because it may need to run a performance optimization hack for
				 * SELECT menus: Only the visible items are shown while sliding
				 * the aside, the rest is rendered at this exact point in time.
				 * Integration tests should then wait for 'onopened' to finish before
				 * they attempt to select items in the aside (since they don't exist).
				 */
				if (this._ismodelled()) {
					var model = this._model;
					if (model.status === 'onopen') {
						if (model.suspendopen) {
							model.status = 'onbeforeopened';
							this._suspendopen = true;
							return; // exit here
						}
					}
				}

				/*
				 * ... otherwise go ahead with the 'onopen' procedure, noting that
				 * integration tests can safely work with the aside from now on.
				 */
				this._updateworld(didopen);
				this.action.add(ts.ui.ACTION_CLOSE);
				this.broadcast.addGlobal(doclose);
				this.key.addGlobal('Esc');
				this.css.add(ts.ui.CLASS_OPEN);
				this.doorman.didopen();

				/**
				 * It would be nice to do this before the Aside opens,
				 * but we can assume that any MVC template has rendered
				 * (actually we can't assume that even when fully open).
				 * Also, assigning focus *while* animating will glitch
				 * the browser, or at least it will mess with Firefox.
				 */
				if (this.autofocus) {
					this.focus();
				}

				/**
				 * Exucute some action whenever new Asides open.
				 * This relates to styling of secondary Asides.
				 */
				var layout = LayoutModel.output.get();
				layout.asides.addObserver(this);

				/**
				 * Finally update the model.
				 */
				if (this._ismodelled()) {
					this._model.status = 'onopened';
				}
			},

			/**
			 * About to close.
			 */
			_willclose: function() {
				this.css.add(classclosing);
				this._updateworld(willclose);
				this.action.remove(ts.ui.ACTION_CLOSE);
				this.broadcast.removeGlobal(doclose);
				this.key.removeGlobal('Esc');
				this._register(false);
				if (this._ismodelled()) {
					this._model.status = 'onclose';
				}
			},

			/**
			 * Fully closed.
			 */
			_didclose: function() {
				var panel = this.dom.q('.ts-panel');
				this._isreallyopen = false;
				this._offset = 0;
				this.dom.hide();
				this._updateworld(didclose);
				this.att.del('data-ts-offset');
				this.attention.exit(panel);
				this.css.remove(ts.ui.CLASS_SECONDARY);
				this.doorman.didclose();
				if (this._ismodelled()) {
					this._model.status = 'onclosed';
				}
			},

			/**
			 * Register opened status in global model.
			 * @param {boolean} open
			 * @returns {ts.ui.AsideSpirit}
			 */
			_register: chained(function(open) {
				var layout = LayoutModel.output.get();
				var asides = layout.asides;
				var id = this.$instanceid;
				if (open) {
					asides.push(id);
				} else {
					gui.Array.remove(asides, asides.indexOf(id));
					asides.removeObserver(this);
				}
				this._index = asides.indexOf(id);
			}),

			/**
			 * Dispatch local actions to control that semi-transparent cover.
			 * @see {ts.ui.DocumentAsidePlugin}
			 * @see {ts.ui.DrawerSpirit}
			 * @param {string} type
			 */
			_updateworld: function(type) {
				this.action.dispatch(type);
			},

			/**
			 * Focus the best possible focusable thing.
			 * TODO: This obviously needs an overhaul.
			 */
			_focusbest: notontouch(function() {
				var elm,
					best = ['[autofocus]', '.ts-checked button'];
				if (
					!best.some(function(selector) {
						if ((elm = this.dom.q(selector))) {
							elm.focus();
						}
						return !!elm;
					}, this)
				) {
					var panel = this.dom.q('.ts-panel');
					if (!this.attention.enter(panel)) {
						panel.tabIndex = 0;
						panel.focus();
					}
				}
			}),

			/**
			 * Compute the z-index.
			 * TODO(jmo@): Read base index from CSS.
			 * @returns {number}
			 */
			_zindex: function() {
				return this._index + (this._isSideBarAside() ? 0 : ts.ui.ZINDEX_ASIDE);
			},

			/**
			 * Confirm position.
			 * @overrides {ts.ui.SideShowSpirit#_confirmposition}
			 */
			_confirmposition: function() {
				if (this._isSideBarAside()) {
					var panel = this.dom.parent(ts.ui.PanelSpirit);
					if (panel && this.dom.containedBy(panel)) {
						throw new Error(
							'In the SideBar, Aside must be positioned outside the ts-panel',
							this.element
						);
					}
				} else {
					this.super._confirmposition();
				}
			}
		},
		{
			// Static ...............................................................

			/**
			 * Stacking offset in percent of the width of the aside.
			 * @type {number}
			 */
			OFFSET_AMOUNT: 3,

			/**
			 * Importantly create the aside with a `.ts-panel` child element.
			 * @param @optional {ts.ui.AsideModel} opt_model
			 * @return {ts.ui.AsideSpirit}
			 */
			summon: confirmed('(object)')(function(opt_model) {
				var html = ts.ui.aside.edbml(opt_model);
				var elem = gui.HTMLParser.parse(html);
				var spirit = this.possess(elem);
				return spirit;
			})
		}
	);
})(gui.Combo.chained, gui.Arguments.confirmed, gui.Client, ts.ui.LayoutModel, function notontouch(
	base
) {
	return function() {
		if (!gui.Client.isTouchDevice) {
			base.apply(this, arguments);
		}
	};
});
