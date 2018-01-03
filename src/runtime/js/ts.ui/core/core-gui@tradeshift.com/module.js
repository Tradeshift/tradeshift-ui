/**
 * Core GUI module.
 */
ts.ui.CoreModule = gui.module('core-gui@tradeshift.com', {
	/**
	 * Channeling spirits to CSS selectors.
	 */
	channel: [
		// stuff that the framework uses
		['html', ts.ui.DocumentSpirit],

		// stuff that developers use
		['[data-ts=Main]', ts.ui.MainSpirit],
		['[data-ts=MainContent]', ts.ui.MainContentSpirit],
		['[data-ts=Frame]', ts.ui.FrameSpirit],
		['[data-ts=Aside]', ts.ui.AsideSpirit],
		['[data-ts=SideBar]', ts.ui.SideBarSpirit],
		['[data-ts=Footer]', ts.ui.AsideFooterSpirit],
		['[data-ts=Panel]', ts.ui.PanelSpirit],
		['[data-ts=Menu]', ts.ui.MenuSpirit],
		['[data-ts=Button]', ts.ui.ButtonSpirit],
		['[data-ts=Buttons]', ts.ui.ButtonMenuSpirit],
		['[data-ts=Link]', ts.ui.LinkSpirit],
		['[data-ts=Pager]', ts.ui.PagerSpirit],
		['[data-ts=Time]', ts.ui.TimeSpirit],
		['[data-ts=Note]', ts.ui.NoteSpirit],
		['[data-ts=Icon]', ts.ui.NextIconSpirit],
		['[data-ts=Spinner]', ts.ui.SpinnerSpirit],
		['[data-ts=Modal]', ts.ui.ModalSpirit],
		['[data-ts=Tag]', ts.ui.TagSpirit],
		['[data-ts=Tags]', ts.ui.TagListSpirit],
		['[data-ts=Spirit]', ts.ui.Spirit]
	],

	/**
	 * This type of selector (as used a lot in forms) will slow the stuff down,
	 * but it does make the markup easy to author. We'll at least make sure that
	 * the channelings are not introduced before they needed.
	 * @see {ts.ui.ButtonMenuSpirit#onconstruct}
	 */
	channelComplexSelectors: function(enabled) {
		if (enabled && !this._channeled) {
			this._channeled = true;
			gui.channel([['.ts-buttons button, .ts-buttons a', ts.ui.ButtonSpirit]]);
		}
	},

	/**
	 * Setup plugins (for all spirits).
	 */
	plugin: {
		guistatus: ts.ui.StatusPlugin,
		guilayout: ts.ui.LayoutPlugin,
		attention: ts.ui.AttentionPlugin
	},

	/**
	 * 1. Setup special plugins for special spirits.
	 */
	oncontextinitialize: function() {
		this._commonplugins();
		this._specialplugins();
		this._documentplugins();
		this._guiattributes();
		this._defaultcolors();
	},

	/**
	 * Let the spirit know what attribute value we use to channel it
	 * so that it may add that attribute value as a CSS classname.
	 * TODO(jmo@): Split this up into something more readable :)
	 */
	onbeforespiritualize: function() {
		var ATTRIBUTE = /^\[data-ts=[a-zA-Z]+\]$/;

		function allcssnames(constructor) {
			return gui.Class
				.ancestorsAndSelf(constructor)
				.map(function(c) {
					return c.$cssname || undefined;
				})
				.filter(function(cssname) {
					return !!cssname;
				})
				.join(' ');
		}

		gui
			.getChannels()
			.map(function(channel) {
				var cssselector = channel[0];
				var constructor = channel[1];
				if (cssselector.trim().match(ATTRIBUTE)) {
					if (constructor.$cssname) {
						throw new Error(
							constructor + ' appears to be channeled twice? ' + constructor.$cssname
						);
					} else {
						var attval = cssselector.replace('data-ts=', '').slice(1, -1);
						var fixval = 'ts-' + attval.toLowerCase();
						constructor.$nicename = attval;
						constructor.$cssname = fixval;
					}
					return constructor;
				}
			})
			.filter(function(constructor) {
				return !!constructor;
			})
			.forEach(function(constructor) {
				constructor.$cssnames = allcssnames(constructor);
			});
	},

	// Private ...................................................................

	/**
	 * Complex selectors have been channeled?
	 * @type {boolean}
	 */
	_channeled: false,

	/**
	 * Override the {gui.EventPlugin} to add support
	 * for PolymerGestures and other special events.
	 */
	_commonplugins: function() {
		var override = true;
		ts.ui.Spirit.plugin('event', ts.ui.EventPlugin, override);
	},

	/**
	 * TODO: SideShowSpirit should also refactor to use the PanelsPlugin
	 */
	_specialplugins: function() {
		ts.ui.ModalSpirit.plugin('panels', ts.ui.PanelsPlugin);
		ts.ui.ModalSpirit.plugin('doorman', ts.ui.DoorManPlugin);
		ts.ui.SideShowSpirit.plugin('doorman', ts.ui.DoorManPlugin);
	},

	/**
	 * Special plugins for the {ts.ui.DocumentSpirit}
	 * to manage the layout model, dialogs and asides
	 * and root level panels (that create TopBar tabs).
	 */
	_documentplugins: function() {
		ts.ui.DocumentSpirit
			.plugin('layoutplugin', ts.ui.DocumentLayoutPlugin)
			.plugin('dialogplugin', ts.ui.DocumentDialogPlugin)
			.plugin('asideplugin', ts.ui.DocumentAsidePlugin)
			.plugin('panelplugin', ts.ui.DocumentPanelPlugin);
	},

	/**
	 * Use `data-ts` instead of `gui` for magic configuration attributes.
	 * TODO: Remove the deprecated 'ts' after a few iterations (perform boost!)
	 * @see wunderbyte.github.io/spiritual-gui/plugin-config.html
	 */
	_guiattributes: function() {
		gui.attributes = ['ts', 'data-ts'];
	},

	/**
	 * Assign a default "colorspace". This will cause
	 * reflow, so it's wise to hardcode it in the HMTL.
	 */
	_defaultcolors: function() {
		var cssp = gui.CSSPlugin;
		var html = document.documentElement;
		if (!html.className.includes('ts-bg')) {
			cssp.add(html, 'ts-bg-lite');
		}
	}
});
