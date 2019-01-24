/**
 * Spirit of the Dox chrome.
 * @using {gui.CSSPlugin} CSSPlugin
 * @using {gui.Then} Then
 */
ts.dox.ChromeSpirit = (function using(CSSPlugin, Then) {
	var BP_TABLET = 600,
		SIDEBAR_MACRO = 320,
		GLOBALTITLE = 'Tradeshift UI',
		ONSEARCH = 'ts-action-search',
		MENUOPEN = 'action-open-menu',
		MENUCLOSE = 'action-close-menu',
		ONDOM = ts.ui.ACTION_FRAME_ONDOM,
		DOLOAD = ts.ui.ACTION_GLOBAL_LOAD,
		ONRESIZE = gui.BROADCAST_RESIZE_END,
		MENUON = ts.ui.BROADCAST_GLOBAL_MENU_OPEN,
		TITLE = ts.ui.ACTION_GLOBAL_DOCUMENT_TITLE,
		ONROTATE = gui.BROADCAST_ORIENTATIONCHANGE,
		ASIDESON = ts.ui.BROADCAST_GLOBAL_ASIDES_WILL_ON,
		ASIDESOFF = ts.ui.BROADCAST_GLOBAL_ASIDES_WILL_OFF,
		DIALOGSON = ts.ui.BROADCAST_GLOBAL_DIALOGS_WILL_BLOCK,
		DIALOGSOFF = ts.ui.BROADCAST_GLOBAL_DIALOGS_DID_UNBLOCK;

	return ts.ui.Spirit.extend({
		/**
		 * Get ready.
		 */
		onready: function() {
			this.super.onready();
			this._app = this.dom.q('.ts-app', ts.ui.AppSpirit);
			this._sbar = this.dom.q('.ts-sidebar', ts.dox.SideBarSpirit);
			this._menu = this.dom.q('.ts-menu', ts.dox.MenuSpirit);
			this._main = this.dom.q('.ts-main', ts.ui.MainSpirit);
			this._menu.life.add(gui.LIFE_RENDER, this);
			this.event.add('message', window);
			this.event.add('hashchange', window);
			this.event.add('transitionend', this._app);
			this.action.add([ONDOM, ONSEARCH, MENUOPEN, MENUCLOSE]).addGlobal([TITLE, DOLOAD]);
			this.broadcast
				.addGlobal([TITLE, MENUON, ONROTATE, ASIDESON, ASIDESOFF, DIALOGSON, DIALOGSOFF])
				.add(ONRESIZE);
			if (location.hash.length > 1) {
				this._onhashchange(location.hash);
			} else {
				location.hash = 'intro/';
			}
			this._layout(window.innerWidth);
			this._setupsearch(this._sbar, this._menu);
		},

		/**
		 * Menu is hidden to supress flickering,
		 * we'll show it as soon as it's rendered.
		 * Also, hide SideBar shadow on first item.
		 */
		onlife: function(l) {
			this.super.onlife(l);
			var first = '.ts-doxmenu > .ts-checked:first-child';
			if (l.type === gui.LIFE_RENDER) {
				this.css.shift(this.dom.q(first), 'intropage');
				if (!this.css.contains('ts-menudone')) {
					this.reflex(function showmenu() {
						this.css.add('ts-menudone');
					}, this);
				}
			}
		},

		/**
		 * Handle action.
		 * @param {gui.Action} a
		 */
		onaction: function(a) {
			this.super.onaction(a);
			switch (a.type) {
				case TITLE:
					this._title(a.data);
					break;
				case MENUOPEN:
					this._openmenu(true);
					break;
				case MENUCLOSE:
					this._openmenu(false);
					break;
				case DOLOAD:
					this._sethashfromhref(a.data.href);
					a.consume();
					break;
				case ONSEARCH:
					this.css.shift(a.data, 'searching');
					break;
				case ONDOM:
					if (ts.dox.booting) {
						this._firstload();
						ts.dox.booting = false;
					} else {
						this._nextload();
					}
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
				case MENUON:
					if (this._iscollapsed()) {
						this._openmenu(true);
					}
					break;
				case ONRESIZE:
				case ONROTATE:
					this._layout(window.innerWidth);
					break;
				case ASIDESON:
					this._cover('ts-asidecover').fadeIn();
					break;
				case ASIDESOFF:
					this._cover('ts-asidecover').fadeOut();
					break;
				case DIALOGSON:
					this._cover('ts-dialogcover').fadeIn();
					break;
				case DIALOGSOFF:
					this._cover('ts-dialogcover').fadeOut();
					break;
			}
		},

		/**
		 * Handle event.
		 * @param {Event} e
		 */
		onevent: function(e) {
			this.super.onevent(e);
			var nested = window !== top;
			switch (e.type) {
				case 'transitionend':
					if (this._thenclosed) {
						this._thenclosed.now();
						this._thenclosed = null;
					}
					break;
				case 'message':
					if (nested && e.data.startsWith('#')) {
						this._onhashchange(e.data);
					}
					break;
				case 'hashchange':
					this._onhashchange(location.hash);
					break;
				case 'click':
					/*
					 * The SideBar closebutton has been hacked to appear and we cannot
					 * assign a callback to this particular button, so we'll monitor
					 * the button like this (and close the menu whenever it is clicked)
					 */
					if (CSSPlugin.contains(e.target, 'ts-noborder')) {
						this._openmenu(false);
					}
					break;
			}
		},

		/**
		 * Handle key.
		 * @param {gui.Key} k
		 */
		onkey: function(k) {
			this.super.onkey(k);
			if (k.down && k.type === 'Esc') {
				this._openmenu(false);
			}
		},

		// Private .................................................................

		/**
		 * Spirit of the SideBar.
		 * @type {ts.dox.MenuSpirit}
		 */
		_sbar: null,

		/**
		 * Spirit of the Menu.
		 * @type {ts.dox.MenuSpirit}
		 */
		_menu: null,

		/**
		 * Spirit of the Main.
		 * @type {ts.ui.MainSpirit}
		 */
		_main: null,

		/**
		 * Some sort of "promise" to resolve menu animation.
		 * @type {gui.Then}
		 */
		_thenclosed: null,

		/**
		 * Search query (while in search mode).
		 * @type {string}
		 */
		_searchquery: '',

		/**
		 * Extract hash from given URL and assign to window location.
		 * @param {string} href
		 */
		_sethashfromhref: function(href) {
			var hash = href.split('#')[1];
			if (hash) {
				location.hash = hash;
			}
		},

		/**
		 * Location hash changed. While developing, we double check for 404.
		 * @param {string} hash
		 */
		_onhashchange: function(hash) {
			if (hash.length > 1) {
				var path = hash.substring(1);
				if (location.hostname === 'localhost') {
					var ajax = new gui.Request('dist/' + path).acceptText();
					ajax.get().then(function preload(status) {
						switch (status) {
							case 200:
								this._load4real(path);
								break;
							case 404:
								ts.ui.Notification.error('404 Not Found');
								break;
							default:
								console.log('Unhandled reponse status', status);
								break;
						}
					}, this);
				} else {
					this._load4real(path);
				}
			}
		},

		/**
		 * Load the page (now known to exist).
		 * @param {string} path
		 */
		_load4real: function(path) {
			this._blocking(true);
			this._menu.selectbestitem(path).then(function(first) {
				this.css.shift(first, 'selectfirstitem');
				this.tick.time(
					function() {
						this._loadnext(path);
					},
					this._isopenmenu() ? 300 : 0
				);
			}, this);
		},

		/**
		 * First page loaded in iframe. When all these scripts have been upladed
		 * to the internet and are not found in the browsers cache, the `flex()`
		 * operation would not run in sync with the layout, so we'll hotfix it.
		 */
		_firstload: function() {
			this._blocking(false);
			this._openmenu(false);
			this._showloading(false);
			this.tick.time(function hotfix() {
				ts.ui.get(document.documentElement).reflex();
				initlunr();
			});
		},

		/**
		 * Subsequent page loaded in iframe: Switch from one iframe to the other.
		 * (we create new iframes to avoid browser history local to the iframes).
		 */
		_nextload: function() {
			this.tick.time(function stabilize() {
				this._openmenu(false);
				this._showloading(false);
				this._blocking(false);
				this._resetsearch(!this._iscollapsed());
				if (this._oldframe) {
					this._oldframe.dom.remove();
					this._oldframe = null;
				}
			});
		},

		/**
		 * Prevent IFRAME from adding to the browser history
		 * be creating an unique IFRAME for every page load.
		 * Make sure not to transition while we are loading.
		 * @param {string} path
		 */
		_loadnext: function(path) {
			this._showloading(true);
			if (this._isopenmenu()) {
				this._openmenu(false);
				this._thenclosed = new Then(function() {
					this._loadnext(path);
				}, this);
			} else {
				path = this._searchquery ? path + '?query=' + this._searchquery : path;
				this._oldframe = this.dom.qdoc('iframe', ts.ui.FrameSpirit) || null;
				this._main.dom.prepend(ts.ui.FrameSpirit.summon('dist/' + path));
			}
		},

		/**
		 * Note that there is a "dead zone" where the iframe
		 * is in mobile breakpoint while the chrome stays in
		 * tablet breakpoint. To avoid this, the breakpoint
		 * should really be managed entirely by the chrome
		 * and posted down to iframes, but this strategy was
		 * abandoned for historical reasons...
		 * @param {number} width
		 */
		_layout: function(width) {
			var some = 'collapse-some';
			var full = 'collapse-full';
			var mobile = width <= BP_TABLET;
			var tablet = width > BP_TABLET && width < BP_TABLET + SIDEBAR_MACRO;
			var desktop = !mobile && !tablet;
			this._sbar.isOpen = desktop;
			this._sbar._closebutton(!desktop);
			this.event.shift(!desktop, 'click', this._sbar);
			if (mobile) {
				this.css.remove(some).add(full);
			} else if (tablet) {
				this.css.remove(full).add(some);
			} else {
				this.css.remove(some).remove(full);
			}
		},

		/**
		 * Show (and hide) blocking cover to prevent the user from
		 * requesting new iframes while the current one is loading.
		 * @param {boolean} block
		 */
		_blocking: function(block) {
			var cover = this._cover('ts-dox-blocking');
			if (block) {
				cover.show();
			} else {
				cover.hide();
			}
		},

		/**
		 * Open the (collapsed) menu.
		 * @param {boolean} uncollapse
		 */
		_openmenu: function(uncollapse) {
			this.css.shift(uncollapse, 'uncollapse');
			this.key.shift(uncollapse, 'Esc');
			this._sbar.open(uncollapse);
		},

		/**
		 * Is menu open (relevant for collapsed menu)?
		 * @returns {boolean}
		 */
		_isopenmenu: function() {
			return this.css.contains('uncollapse');
		},

		/**
		 * Is layout collapsed (tablet or mobile)?
		 * @returns {boolean}
		 */
		_iscollapsed: function() {
			return ['collapse-some', 'collapse-full'].some(function(name) {
				return this.css.contains(name);
			}, this);
		},

		/**
		 * DISABLED FOR NOW (used for spinner in the Header, if we need that)
		 * This toggles the classname `ts-loading`
		 * on the root HTML element in all frames.
		 * TODO: Support ABORTED if and when we get a 404.
		 * @param {boolean} loading
		 */
		_showloading: function(loading) {
			// LOADING = ts.ui.BROADCAST_GLOBAL_APP_LOADING,
			// COMPLETE = ts.ui.BROADCAST_GLOBAL_APP_COMPLETE,
			// this.broadcast.dispatchGlobal(loading ? LOADING : COMPLETE);
		},

		/**
		 * Get-create CoverSpirit for misc things. First
		 * run creates the spirit and appends it to BODY.
		 * @param {string} id
		 * @returns {ts.ui.CoverSpirit}
		 */
		_cover: function(id) {
			return ts.ui.CoverSpirit.getCover(id);
		},

		/**
		 * Match topframe title to iframe document title.
		 * @param {string} title
		 */
		_title: function(title) {
			if (title === GLOBALTITLE) {
				document.title = GLOBALTITLE;
			} else {
				document.title = title + ' — ' + GLOBALTITLE;
			}
		},

		/**
		 * @param {ts.ui.SideBarSpirit} sidebar
		 * @param {ts.ui.MenuSpirit} menu
		 */
		_setupsearch: function(sidebar, menu) {
			var chrome = this;
			sidebar.search({
				onsearch: function(query) {
					chrome._searchquery = query;
					chrome.broadcast.dispatchGlobal('dox-search-query', query);
					if (query) {
						menu.showresults(query, search(query));
					} else {
						menu.showmenu();
					}
				}
			});
		},

		/**
		 * In mobile and tablet, clear the search when SideBar closes.
		 * (may not be the optimal workflow for the searching user!)
		 * @param {boolean} desktop Abort in desktop breakpoint
		 */
		_resetsearch: function(desktop) {
			if (!desktop) {
				this.dom.q('.ts-search', ts.ui.SearchSpirit).value = '';
				if (this._searchquery) {
					this._searchquery = null;
					this._menu.showmenu();
				}
			}
		}
	});
})(gui.CSSPlugin, gui.Then);

// LUNR ........................................................................

var lunrindex, pagesindex;

/**
 * Trigger a search in lunr and transform the result
 * @param	{String} query
 * @return {Array}	results
 */
function initlunr() {
	$.getJSON('/dist/lunr.json')
		.done(function(index) {
			pagesindex = index;
			lunrindex = lunr(function() {
				this.field('title', { boost: 10 });
				this.field('tags', { boost: 5 });
				this.field('content');
				this.ref('href');
			});
			pagesindex.forEach(function(page) {
				if (page) {
					lunrindex.add(page);
				}
			});
		})
		.fail(function(jqxhr, textStatus, error) {
			var err = textStatus + ', ' + error;
			console.error('Error getting index flie:', err);
		});
}

/**
 * Trigger a search in lunr and transform the result
 * @param	{String} query
 * @return {Array}	results
 */
function search(query) {
	return lunrindex.search(query).map(function(result) {
		return pagesindex.filter(function(page) {
			return page && page.href === result.ref;
		})[0];
	});
}
