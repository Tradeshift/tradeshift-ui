/**
 * Spirit of the (main) footer.
 * TODO: Implement `onpage` callback for parity with Table.
 * @extends {ts.ui.Spirit}
 * @using {gui.Combo#chained} chained
 */
ts.ui.FooterSpirit = (function using(chained) {
	return ts.ui.Spirit.extend({
		/**
		 * Add local and global classname.
		 */
		onenter: function() {
			this.super.onenter();
			this.css.add('ts-mainfooter ts-bg-lite');
			this.guilayout.shiftGlobal(true, 'ts-has-footer');
		},

		/**
		 * @param {ts.ui.ButtonCollection} [buttons]
		 * @returns {this|ts.ui.ButtonCollection}
		 */
		buttons: chained(function(buttons) {
			var bar = this._statusbar();
			if (arguments.length) {
				bar.buttons(buttons);
			} else {
				return bar.buttons();
			}
		}),

		/**
		 * @param {ts.ui.ButtonCollection} [buttons]
		 * @returns {this|ts.ui.ButtonCollection}
		 */
		actions: chained(function(actions) {
			var bar = this._actionbar();
			if (arguments.length) {
				bar.actions(actions);
			} else {
				return bar.actions();
			}
		}),

		/**
		 * Get or set the pager. Pass `null` to remove the pager (via bad API :/)
		 * @param @optional {object|ts.ui.PagerModel|null} [json]
		 * @returns {ts.ui.PagerModel|ts.ui.ToolBarSpirit}
		 */
		pager: chained(function(json) {
			var bar = this._statusbar();
			if (arguments.length) {
				bar.pager(json);
			} else {
				return bar.pager();
			}
		}),

		/**
		 * @param {boolean} is
		 */
		selectable: chained(function(is) {
			console.log('TODO: ' + this);
		}),

		/**
		 * Handle action.
		 * @param {gui.Action} a
		 */
		onaction: function(a) {
			this.super.onaction(a);
			if (a.type === ts.ui.ACTION_STATUSBAR_LEVEL) {
				this._globallayout(a.data);
				a.consume();
			}
		},

		// Private .................................................................

		/**
		 * @returns {ts.ui.StatusBarSpirit}
		 */
		_statusbar: function statusbar() {
			if (!statusbar.spirit) {
				statusbar.spirit = this.dom.append(ts.ui.StatusBarSpirit.summon());
				this.action.add(ts.ui.ACTION_STATUSBAR_LEVEL);
				this.css.add('has-statusbar');
				this._globallayout();
			}
			return statusbar.spirit;
		},

		/**
		 * @returns {ts.ui.ActionBarSpirit}
		 */
		_actionbar: function actionbar() {
			if (!actionbar.spirit) {
				actionbar.spirit = this.dom.prepend(ts.ui.ToolBarSpirit.summon());
				actionbar.spirit.micro();
				this.css.add('has-actionbar');
				this._globallayout();
			}
			return actionbar.spirit;
		},

		/**
		 * Set classnames on `html` to control the `bottom` position of Main.
		 * TODO: THE `HIDDEN` STUFF IS NOT REALLY SUPPORTED YET!
		 * @param {number} [level]
		 */
		_globallayout: function(level) {
			var offset = 0;
			var status = this._statusbar.spirit;
			var action = this._actionbar.spirit;
			if (status && !status.hidden) {
				offset += level || 3;
			}
			if (action && !action.hidden) {
				offset += 2;
			}
			this.action.dispatch(ts.ui.ACTION_FOOTER_LEVEL, offset);
		}
	});
})(gui.Combo.chained);
