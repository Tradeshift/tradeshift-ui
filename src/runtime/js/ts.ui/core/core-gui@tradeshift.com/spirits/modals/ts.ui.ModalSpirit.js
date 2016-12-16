/**
 * Spirit of the Modal.
 * @using {ts.ui.ts.ui.ToolBarSpirit} ToolBarSpirit
 * @using {function} gui.Combo.chained
 */
ts.ui.ModalSpirit = (function using(ToolBarSpirit, chained) {

	var willopen = ts.ui.BROADCAST_DIALOG_WILL_OPEN,
		goopen = ts.ui.BROADCAST_DIALOG_GO_OPEN,
		didopen = ts.ui.BROADCAST_DIALOG_DID_OPEN,
		willclose = ts.ui.BROADCAST_DIALOG_WILL_CLOSE,
		didclose = ts.ui.BROADCAST_DIALOG_DID_CLOSE;

	return ts.ui.Spirit.extend({

		/**
		 *
		 */
		onready: function() {
			this.super.onready();
			this._setup(this.dom.q('.ts-panel'));
		},

		/**
		 *
		 */
		open: function(open) {
			if(this._confirmposition()) {
				this.broadcast.dispatch(willopen);
				this.css.shift(open, 'ts-open');
				this.broadcast.dispatch(didopen);
			}
		},

		/**
		 * Get or set the title.
		 */
		title: chained(function(title) {
			var header = this._header();
			if(arguments.length) {
				header.title(title);
			} else {
				return header.title();
			}
		}),

		/**
		 *
		 */
		buttons: function() {

		},


		// Private .................................................................

		/**
		 *
		 */
		_setup: function(panel) {
			if(panel) {
				this.attention.trap(panel);
			} else {
				throw new Error('Expected a ts-panel');
			}
		},

		/**
		 * Get spirit of the header.
		 * @returns {ts.ui.ToolBarSpirit}
		 */
		_header: function() {
			var ToolBarSpirit = ts.ui.ToolBarSpirit; // TODO: Load this after!
			this.css.add('ts-hasheader');
			return this.dom.q('header.ts-toolbar', ToolBarSpirit) || 
				this.dom.prepend(ToolBarSpirit.summon('header', 'ts-bg-blue'));
		},

		/**
		 * Get spirit of the footer.
		 * @returns {ts.ui.ToolBarSpirit}
		 */
		_footer: function() {
			this.css.add('ts-hasfooter');
			var ToolBarSpirit = ts.ui.ToolBarSpirit; // TODO: Load this after!
			return this.dom.q('footer.ts-toolbar', ToolBarSpirit) || 
				this.dom.append(ToolBarSpirit.summon('footer', 'ts-bg-green'));
		},

		/**
		 * Confirm that we're not nested inside Main.
		 * @returns {boolean}
		 * @throws {Error}
		 */
		_confirmposition: function() {
			if(this.guilayout.outsideMain()) {
				return true;
			} else {
				throw new Error(
					this + ' must be positioned outside Main', this.element
				);
			}
		},

	});

}(ts.ui.ToolBarSpirit, gui.Combo.chained));