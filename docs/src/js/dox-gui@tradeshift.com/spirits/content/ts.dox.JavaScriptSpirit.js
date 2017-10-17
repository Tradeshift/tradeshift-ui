/**
 * Spirit of the script snippet.
 * @extends {ts.dox.PrismSpirit}
 */
ts.dox.JavaScriptSpirit = (function() {
	return ts.dox.PrismSpirit.extend({
		/**
		 * Handle event.
		 *
		onevent: function(e) {
			var elm = e.target;
			var prism = this.dom.q('.prism');
			if (e.type === 'click' && prism && !this._editor) {
				if (prism === elm || gui.DOMPlugin.contains(prism, e.target)) {
					this._edit();
				}
			}
		},
		*/

		/**
		 * Prepare the textarea (code editor).
		 */
		onasync: function() {
			this.super.onasync();
			if (this.css.contains('runnable')) {
				var area = this.dom.q('.editcode');
				this._editor = this._makeeditor(area);
				this._editor.value = this.code;
			}
		},

		// Private ...................................................................

		/**
		 * Ad hoc code editor.
		 * @type {ts.ui.TextAreaSpirit}
		 */
		_editor: null,

		/**
		 * @param {object} config
		 */
		_parseconfig: function(config) {
			this.super._parseconfig(config);
			if (config.runs) {
				this.css.add('runnable');
				var classed = this.css.contains('attention');
				var primary = this._attention(classed);
				var buttons = this.buttons();
				var that = this;
				buttons.push(
					{
						type: primary ? 'ts-primary' : 'ts-tertiary',
						label: 'Run This Code',
						onclick: function() {
							that.css.remove('attention');
							that._run();
						}
					},
					{
						visible: false,
						label: 'Revert',
						id: 'button-revert',
						onclick: function() {
							that._revert();
							this.hide();
						}
					}
				);
				this._head().script.run();
				this.event.add('click');
			}
		},

		/**
		 * Run this code.
		 */
		_run: function() {
			try {
				new Function(this._editor ? this._editor.value : this.code)();
			} catch (exception) {
				console.error(exception.message);
				if (this._editing()) {
					ts.ui.Notification.error(exception.message);
				} else {
					console.error(exception.message);
					ts.ui.Notification.warning(
						[
							'Script error! Sometimes a snippet depends on a previous ',
							'snippet. If there are other snippets on the page, try ',
							'running them in a different order.'
						].join(''),
						'Alrighty'
					);
				}
			}
		},

		/**
		 * Revert hacked code.
		 */
		_revert: function() {
			this._editor.value = this.code;
			this.css.remove('editmode');
		},

		/**
		 * Currently editing the code snippet?
		 * @returns {boolean}
		 */
		_editing: function() {
			return this.buttons().get('button-revert').visible;
		},

		/**
		 * Draw attention.
		 * @param {boolean} yes
		 * @returns {boolean}
		 */
		_attention: function(yes) {
			if (yes) {
				this.dom.append(
					gui.HTMLParser.parseToNode(
						[
							'<div class="message">',
							'<p>',
							'<i class="ts-icon-arrowleft"></i>',
							'<strong>Interactive time</strong><br/>',
							'Please <code>Run this code</code>',
							'</p>',
							'</div>'
						].join('\n')
					)
				);
			}
			return yes;
		},

		/**
		 * Make TAB work more or less. Also setup to show the Delete icon on changes.
		 * https://stackoverflow.com/questions/6637341/use-tab-to-indent-in-textarea
		 * TODO: Preserve indent level :/
		 * @param {HTMLTextAreaElement} area
		 * @returns {HTMLTextAreaElement}
		 */
		_makeeditor: function(area) {
			var css = this.css;
			var value = area.value;
			var buttons = this.buttons();
			$(area)
				.on('keydown', function(e) {
					var keyCode = e.keyCode;
					if (keyCode === 9) {
						e.preventDefault();
						var start = this.selectionStart;
						var end = this.selectionEnd;
						var val = this.value;
						var selected = val.substring(start, end);
						var re, count;
						if (e.shiftKey) {
							if (selected.length > 0) {
								// TODO: add support for shift-tabbing without a selection
								re = /^\t/gm;
								count = -selected.match(re).length;
								this.value =
									val.substring(0, start) + selected.replace(re, '') + val.substring(end);
							}
						} else {
							re = /^/gm;
							count = selected.match(re).length;
							this.value =
								val.substring(0, start) + selected.replace(re, '\t') + val.substring(end);
						}
						if (start === end) {
							this.selectionStart = end + count;
						} else {
							this.selectionStart = start;
						}
						this.selectionEnd = end + count;
					}
				})
				.on('keyup', function() {
					var changed = area.value !== value;
					buttons.get('button-revert').visible = changed;
					css.shift(changed, 'editmode');
				});
			return area;
		}
	});
})();
