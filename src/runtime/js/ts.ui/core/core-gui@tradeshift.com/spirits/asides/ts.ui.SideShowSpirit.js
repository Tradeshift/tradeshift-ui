/**
 * Base spirit for aside-like components. 
 * @see {ts.ui.AsideSpirit}
 * @see {ts.ui.SideBarSpirit}
 * @see @deprecated {ts.ui.DrawerSpirit}
 * @using {gui.Combo.chained}
 * @using {gui.Client} Client
 * @using {gui.HTMLParser} Parser
 * @using {gui.Object} GuiObject
 * @using {ts.ui.BACKGROUND_COLORS} Colors
 */
ts.ui.SideShowSpirit = (function using(chained, Client, Parser, GuiObject, Colors) {

	// custom dom events (for public consumption)
	var domevent = {
		WILLOPEN: ts.ui.EVENT_ASIDE_WILL_OPEN,
		DIDOPEN: ts.ui.EVENT_ASIDE_DID_OPEN,
		WILLCLOSE: ts.ui.EVENT_ASIDE_WILL_CLOSE,
		DIDCLOSE: ts.ui.EVENT_ASIDE_DID_CLOSE
	};
	
	function getcolor(spirit) {
		return Object.keys(Colors).map(function(key) {
			return Colors[key];
		}).reduce(function(result, color) {
			return result || (spirit.css.contains(color) ? color : null);
		}, null);
	}

	return ts.ui.Spirit.extend({

		/**
		 * Open?
		 * @type {boolean}
		 */
		isOpen: false,

		/**
		 * Open for implementation.
		 * @type {string|function}
		 */
		onopen: null,

		/**
		 * Open for implementation.
		 * @type {string|function}
		 */
		onopened: null,

		/**
		 * Open for implementation.
		 * @type {string|function}
		 */
		onclose: null,

		/**
		 * Open for implementation.
		 * @type {string|function}
		 */
		onclosed: null,

		/**
		 *(work in progress)
		 * @type {boolean}
		 */
		flipped: false,

		/**
		 * ts.ui.SpinnerSpirit.
		 */
		spin: null,

		/**
		 * @param {boolean} busy
		 */
		busy: function(busy) {
			this._initspin(busy);
			if(busy){
				this.guistatus.busy(this.$instanceid);	
			}else {
				this.guistatus.done(this.$instanceid);	
			}
		},

		/**
		 * Setup.
		 */
		onenter: function() {
			this.super.onenter();
			if(this.flipped) {
				//this.css.add('ts-flipped'); TODO!
				this.event.add('transitionend');
				this.css.add('ts-flipping ts-flip-init');
				this.tick.time(function transition_ok() {
					this.css.add('ts-flip-out');
				});
			}
		},
		
		/**
		 * Backgrund color and dropshadow management was moved to here because 
		 * it needs to happen after the header (titlebar) has been rendered.
		 */
		onasync: function() {
			this.super.onasync();
			this._fixappearance();
		},

		/**
		 * Get ready.
		 */
		onready: function() {
			this.super.onready();
			this._confirmpanel();
			this.css.add('ts-sideshow');
			this._initfooter(window.MutationObserver || window.WebKitMutationObserver);
			if(this.isOpen) {
				this.broadcast.add(gui.BROADCAST_RESIZE_END);
			}
		},

		/**
		 * Reflex also when moved to another position (V4 scenario)
		 */
		onattach: function() {
			this.super.onattach();
			this._reflex();
		},

		/**
		 * Detach hacky mutation observer.
		 */
		ondestruct: function() {
			this.super.ondestruct();
			if(this._observer) {
				this._observer.disconnect();
			}
		},

		/**
		 * On EDBML rendered.
		 */
		onrender: function() {
			this.super.onrender();
			this._confirmpanel(true);
			this._reflex();
		},

		/**
		 * Window resized (probably).
		 */
		onflex: function() {
			this.super.onflex();
			this._reflex();
		},

		/**
		 * Handle event.
		 * @param {Event} e
		 */
		onevent: function(e) {
			this.super.onevent(e);
			switch(e.type) {
				case 'DOMSubtreeModified':
					this._reflex(); // reflex on footer update in IE
					break;
				case 'transitionend':
					if(this._flipping) {
						this._ontransitionend(
							ts.ui.get(e.target)
						);
					}
					break;
			}
		},

		/**
		 * Set or get header title.
		 * @param {string} title
		 * @return {ts.ui.AsideSpirit|string}
		 */
		title: chained(function(title) {
			var header = this._headerspirit();
			if(arguments.length) {
				this._reflex(function() {
					header.title(title);
				});
			} else {
				return header.title();
			}
		}),

		/**
		 * Get or set header model.
		 * @param @optional {object} opt_json
		 * @returns {ts.ui.ToolBarModel}
		 */
		header: function(opt_json) {
			return this._headerspirit().model(opt_json);
		},

		/**
		 * Open AND close the aside. Setup to support the HTML
		 * attribute: gui.open="true|false"
		 * @param {boolean=} opt_open Omit to simply open.
		 * @return {ts.ui.AsideSpirit}
		 */
		open: chained(function(opt_open) {
			if (!gui.Type.isBoolean(opt_open)) {
				opt_open = true;
			}
			if (this._shouldtoggle(opt_open)) {
				this.att.set('data-ts.open', opt_open);
				if (opt_open) {
					if (!this.isOpen) {
						this.isOpen = true;
						this._open(this.life.async);
					}
				} else {
					if (this.isOpen) {
						this.isOpen = false;
						this._close(this.life.async);
					}
				}
			}
		}),

		/**
		 * Close the aside.
		 * @return {ts.ui.AsideSpirit}
		 */
		close: chained(function() {
			this.open(false);
		}),

		/**
		 * Toggle the aside.
		 * @return {ts.ui.AsideSpirit}
		 */
		toggle: chained(function() {
			this.open(!this.isOpen);
		}),

		/**
		 * Announce to the {ts.ui.DocumentAsidePlugin} that we intend to flip.
		 */
		flip: function() {
			this.action.dispatch('FLIP', this.flipped);
		},


		// Privileged ..............................................................

		/**
		 * Actually flip the thing.
		 * @returns {gui.Then} Some kind of Promise-like object
		 */
		$flip: function() {
			if(!this._flipping) {
				this._flipping = new gui.Then();
				this.event.add('transitionend');
				this.css.remove('ts-flipped').add('ts-flipping');
				this.tick.time(function transition_ok() {
					this.css.add(this.flipped ? 'ts-flip-in' : 'ts-flip-out');
				});
			}
			return this._flipping;
		},


		// Private .................................................................
		
		/**
		 * Monitor footer updates until we can enable CSS layout again.
		 * @type {MutationObserver}
		 */
		_observer: null,

		/**
		 * We can think of this as a Promise (code is old).
		 * @type {gui.Then}
		 */
		flipping: false,

		/**
		 * @deprecated
		 * The classname `ts-internal` will make this thing not behave 
		 * much like an Aside because that was needed for teams that 
		 * didn't want to use Asides. The classname affects both JS 
		 * behavior and CSS styling. When we get support for different 
		 * versions of UI Components (in V4), we should see if this 
		 * can be deprecated in favor of standard UI Components.
		 * @returns {boolean}
		 */
		_isinternal: function() {
			return this.css.contains('ts-internal');
		},

		/**
		 * Using JS instead of CSS flex because Chrome has a nasty public breakdown.
		 * TODO: Setup to only reflex if the height of header or footer has changed.
		 * @param @optional {function} action Optionally flex after executing this.
		 * @returns {object}
		 */
		_reflex: function(action) {
			var panel, avail = this.box.height, height = 0, thing = (action ? action.call(this) : null);
			if(this.isOpen && avail) {
				var asides = [];
				this.dom.children(gui.Spirit).forEach(function(spirit) {
					if(ts.ui.PanelSpirit.is(spirit) && spirit.visible) {
						panel = spirit;
					} else {
						if(ts.ui.AsideSpirit.is(spirit)) {
							asides.push(spirit);
						} else {
							height += spirit.box.height;
						}
					}
				});
				if(panel) {
					panel.css.height = avail - height;
				}
				// TODO: Not this on global reflex!!!!!!!!!
				asides.forEach(function(aside) {
					aside._reflex(); // TODO: not so private after all...
				});
			}
			return thing;
		},

		/**
		 * Confirm and setup the panel.
		 * @param {boolean} insist
		 * @return {ts.ui.Spirit}
		 */
		_confirmpanel: function(insist) {
			if(insist || !this._isinternal()) {
				var panel = this.dom.q('.ts-panel', ts.ui.PanelSpirit);
				if (!panel) {
					throw new Error('Expected a ts-panel');
				}
				return panel;
			}
		},

		/**
		 * Confirm that we're not nested inside MAIN.
		 * - The {ts.ui.AsideSpirit} does this when it opens
		 * - The {ts.ui.SideShowSpirit} does it after a second
		 * - The {ts.ui.CollaborationSpirit} doesn't do this because of politics.
		 */
		_confirmposition: function() {
			if(!this._isinternal()) {
				if(!this.guilayout.outsideMain()) {
					throw new Error(
						this + ' must be positioned outside ts-main', this.element
					);
				}
			}
		},

		/**
		 * Runs on open and close. If the state changes:
		 *
		 * 1. Fire custom DOM event
		 * 2. Return whether or not this was preventDefaulted.
		 * @param {boolean} open
		 * @returns {boolean}
		 */
		_shouldtoggle: function(open) {
			if (open !== this.isOpen) {
				return (this.event.dispatch(open ?
					domevent.WILLOPEN : domevent.WILLCLOSE, {
						bubbles: true,
						cancelable: true
					}
				));
			}
			return false;
		},

		/**
		 * Get the header (and create the header if it doesn't already exist).
		 * @returns {ts.ui.ToolBarSpirit}
		 */
		_headerspirit: function() {
			return (
				this.dom.q('this > .ts-header', ts.ui.ToolBarSpirit) || 
				this._reflex(function createheader() {
					return this.dom.prepend(
						ts.ui.ToolBarSpirit.summon('header', 'ts-header')
					);
				})
			);
		},

		/**
		 * The footer versus panel layout was originally implemented using 
		 * flexbox but there was a problem with this whenever CSS transitions 
		 * and transform were added, so we've switched to JS layout. This means 
		 * that we have to recalculate the layout whenever content is changed 
		 * in the footer, but fortunately that's cost-effective nowadays.
		 * TODO: We should at some point attempt to go back to CSS layout, 
		 * but note that the problem (in Chrome only!) is only apparent 
		 * in a production/sandbox environment. They are however easy to spot.
		 * @param {constructor} Observer Which is undefined in old IE versions
		 */
		_initfooter: function(Observer) {
			var footer = this.dom.q('.ts-footer');
			if(footer) {
				if(Observer) {
					this._observer = new Observer(function() {
						this._reflex();
					}.bind(this));
					this._observer.observe(footer, {
						attributes: true,
						childList: true,
						characterData: true,
						subtree: true
					});
				} else { // TODO: Perhaps replace this with a timer?
					this.event.add('DOMSubtreeModified', footer, this);
				}
			}
		},

		/**
		 * (work in progress)
		 * @param {ts.ui.Spirit} spirit
		 */
		_ontransitionend: function(spirit) {
			if(ts.ui.PanelSpirit.is(spirit)) {
				this.event.remove('transitionend');
				this.css.remove('ts-flipping ts-flip-in ts-flip-out');
				if(this.css.contains('ts-flip-init')) {
					this.css.remove('ts-flip-init').add('ts-flipped');
				} else {
					this.flipped = !this.flipped;
					this.css.shift(this.flipped, 'ts-flipped');
				}
				this._flipping.now();
				this._flipping = null;
			}
		},
		
		/**
		 * Add or remove the closing X button in the titlebar.
		 * @param @optional {boolean} show
		 */
		_closebutton: function(show) {
			var that = this;
			var tool = this._headerspirit();
			var list = tool.buttons();
			var butt = list.get('close-button');
			if(show !== false) {
				if(!butt) {
					list.push({
						item: 'button',
						icon: 'ts-icon-close',
						align: 'right',
						id: 'close-button',
						onclick: function() {
							that.close();
						}
					});
				}
			} else if(butt) {
				list.remove(butt);
			}
		},

		/**
		 * Opening scene implemented by subclass(es). 
		 * Except for the coloring stuff, apparently.
		 * @param {boolean} animated
		 * @returns {boolean}
		 */
		_open: function(animated) {
			return this._execute('onopen') !== false;
		},

		/**
		 * Closing stuff implemented by subclass(es).
		 * @param {boolean} animated
		 * @returns {boolean}
		 */
		_close: function(animated) {
			return this._execute('onclose') !== false;
		},
		
		/**
		 *
		 *
		_willopen: function() {
			return this._execute('onopen') !== false;
		},
		
		/**
		 *
		 *
		_willclose: function() {
			return this._execute('onclose') !== false;
		},
		*/

		/**
		 * If you set the attribute ts.busy is true, you will see the spinner in the main
		 * param {boolean} busy
		 */
		_initspin: function(busy) {
			if (!this.spin) {
				this.spin = ts.ui.SpinnerSpirit.summon();
			}
			if (busy) {
				var opts = {
					message:busy,
					top:"226px"
				};
				this.spin.spin(this.element, opts);
			} else {
				this.spin.stop();
			}
		},
		
		/**
		 * Manage background colors and dropshadows.
		 */
		_fixappearance: function() {
			var mycolor = this._extractcolor('ts-bg-blue');
			var members = this.constructor.$bgmembers;
			this._transfercolor(mycolor, members);
			this._dropshadows(this.dom);
		},
		
		/**
		 * If spirit was created via a model, return the model color. 
		 * Otherwise return any bg-color classname found in the HTML 
		 * (and also remove it, it will soon be applied elsewhere).
		 * @param {string} color Fallback color!
		 */
		_extractcolor: function(color) {
			function fixweirdlooking(c) {
				return c.match(/ts-bg-lite|ts-bg-white/) ? 'ts-bg-blue' : c;
			}
			if(this._ismodelled() && this._model.color) {
				color = fixweirdlooking(this._model.color);
			} else {
				GuiObject.each(Colors, function(key, value) {
					if(this.css.contains(value)) {
						this.css.remove((color = value));
					}
				}, this);
			}
			return color;
		},
		
		/**
		 * Transform background color to members (unless it 
		 * already has a background color classname given).
		 * @param {string} color
		 * @param {Array<string>} selectors
		 */
		_transfercolor: function(color, selectors) {
			var spirit, dom = this.dom;
			selectors.forEach(function(selector) {
				if((spirit = ts.ui.get(dom.q(selector)))) {
					if(selector === '.ts-header') {
						spirit.css.remove('ts-bg-lite').add(color);
						spirit._model.color = color;
					} else {
						var classname = spirit.css.name();
						if(!classname.includes('ts-bg')) {
							spirit.css.add(color);
						}
					}
				}
			});
		},
		
		/**
		 * Inject the dropshadows that are done with DIVs instead of simple CSS 
		 * box-shadow because the box-shadows would spill out all over the page in 
		 * a carefully managed z-index setup where everything is in the same stack.
		 * @param {gui.DOMPlugin} dom
		 */
		_dropshadows: function(dom) {
			var shade = Parser.parseToNode('<div class="ts-shadow"></div>');
			var panel = dom.q('.ts-panel', ts.ui.PanelSpirit);
			var headr = dom.q('.ts-header', ts.ui.ToolBarSpirit);
			var footr = dom.q('.ts-footer', ts.ui.FooterSpirit);
			var color = getcolor(panel) || 'ts-bg-white';
			if(headr && getcolor(headr) === color) {
				panel.dom.before(shade.cloneNode());
			}
			if(footr && getcolor(footr) === color) {
				footr.dom.before(shade.cloneNode());
			}
		},
		
		/**
		 * Execute callback configured via HTML attribute or via JS property.
		 * The 'this' keyword points to the element or the spirit respectively.
		 * TODO (jmo@): convert potential string to function sometimes sooner...
		 * @type {String|function}
		 * @returns {boolean}
		 */
		_execute: function(callback) {
			if ((callback = this[callback])) {
				switch (gui.Type.of(callback)) {
					case 'string':
						return new Function(callback).call(this);
					case 'function':
						return callback.call(this);
				}
			}
			return true;
		},

	}, { // Xstatic ..............................................................
		
		/**
		 * List of members that should inherit any assigned background color.
		 * @type {Array<string>}
		 */
		$bgmembers: ['.ts-header']
		
	});

}(gui.Combo.chained, gui.Client, gui.HTMLParser, gui.Object, ts.ui.BACKGROUND_COLORS));
