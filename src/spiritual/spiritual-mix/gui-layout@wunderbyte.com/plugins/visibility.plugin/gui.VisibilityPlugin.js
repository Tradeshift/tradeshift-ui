/**
 * Visibility is an abstract status. When you mark a spirit as visible or
 * invisible, the methods `onvisible` or `oninvisible` will be called on
 * spirit and descendants. Current visibility status can be read in the
 * {gui.LifePlugin}: `spirit.life.visible`. Visibility is resolved async,
 * so this property is `undefined` on startup. If you need to take an action
 * that depends on visibility, just wait for `onvisible` to be invoked.
 * @TODO: Could document.elementFromPoint() be used to detect hidden stuff?
 * @TODO: hook this up to http://www.w3.org/TR/page-visibility/
 * @TODO: Make sure that visibility is updated after `appendChild`
 * @extends {gui.Plugin}
 * @using {gui.Combo#chained}
 */
gui.VisibilityPlugin = (function using(chained) {
	return gui.Plugin.extend({

		/**
		 * Mark spirit visible.
		 * @returns {gui.VisibilityPlugin}
		 */
		on: chained(function() {
			gui.VisibilityPlugin.on(this.spirit);
		}),

		/**
		 * Mark spirit invisible.
		 * @returns {gui.VisibilityPlugin}
		 */
		off: chained(function() {
			gui.VisibilityPlugin.off(this.spirit);
		})

	}, {}, { // Static ...........................................................

		/**
		 * Mark spirit visible. This will remove the `._gui-invisible`
		 * classname and invoke `onvisible` on spirit and descendants.
		 * Once visibility has been resolved on startup, the target
		 * spirit must be marked invisible for this to have effect.
		 * @param {gui.Spirit} spirit
		 */
		on: function(spirit) {
			var classname = gui.CLASS_INVISIBLE;
			if (spirit.life.visible === undefined || spirit.css.contains(classname)) {
				spirit.css.remove(classname);
				this._go(spirit, true);
			}
		},

		/**
		 * Mark spirit invisible. This will append the `._gui-invisible`
		 * classname and invoke `oninvisible` on spirit and descendants.
		 * @param {gui.Spirit} spirit
		 */
		off: function(spirit) {
			var classname = gui.CLASS_INVISIBLE;
			switch (spirit.life.visible) {
				case true:
				case undefined:
					spirit.css.add(classname);
					this._go(spirit, false);
					break;
			}
		},

		// Privileged static .......................................................

		/**
		 * Initialize spirit visibility.
		 * @TODO again after `appendChild` to another position.
		 * Invoked by the {gui.Guide}.
		 * @param {gui.Spirit} spirit
		 */
		$init: function(spirit) {
			if (!spirit.$destructed) {
				this._go(spirit, !this._invisible(spirit));
			}
		},

		// Private static ..........................................................

		/**
		 * Spirit is invisible? The point here is to not evaluate these potentially
		 * costly selectors for all new spirits, so do prefer not to use this method.
		 * Wait instread for methods `onvisible` and `oninvisible` to be invoked.
		 * @param {gui.Spirit} spirit
		 * @returns {boolean}
		 */
		_invisible: function(spirit) {
			return spirit.css.contains(gui.CLASS_INVISIBLE) ||
				spirit.css.matches('.' + gui.CLASS_INVISIBLE + ' *');
		},

		/**
		 * Recursively update spirit and descendants visibility.
		 * @param {gui.Spirit} first
		 * @param {boolean} show
		 */
		_go: function(first, visible) {
			var type = visible ? gui.CRAWLER_VISIBLE : gui.CRAWLER_INVISIBLE;
			new gui.Crawler(type).descendGlobal(first, {
				handleSpirit: function(spirit) {
					var init = spirit.life.visible === undefined;
					if (spirit !== first && spirit.css.contains(gui.CLASS_INVISIBLE)) {
						return gui.Crawler.SKIP_CHILDREN;
					} else if (visible) {
						if (!spirit.life.visible || init) {
							spirit.life.visible = true;
							spirit.life.dispatch(gui.LIFE_VISIBLE); // TODO: somehow after the fact!
							spirit.onvisible();
						}
					} else {
						if (spirit.life.visible || init) {
							spirit.life.visible = false;
							spirit.life.dispatch(gui.LIFE_INVISIBLE);
							spirit.oninvisible();
						}
					}
				}
			});
		}

	});
}(gui.Combo.chained));
