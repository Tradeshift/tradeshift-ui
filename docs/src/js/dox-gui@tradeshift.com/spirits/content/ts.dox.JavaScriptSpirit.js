/**
 * Spirit of the script snippet.
 */
ts.dox.JavaScriptSpirit = ts.dox.PrismSpirit.extend({

	/**
	 * Handle event.
	 */
	onevent: function(e) {
		var elm = e.target;
		var prism = this.dom.q('.prism');
		if (e.type === 'click' && prism && !this._editor) {
			if (prism === elm || gui.DOMPlugin.contains(prism, e.target)) {
				this._edit();
			}
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
			var classed = this.css.contains('attention');
			var primary = this._attention(classed);
			var buttons = this._toolbar.buttons();
			var that = this;
			this._toolbar.buttons().push({
				type: primary ? 'ts-primary' : 'ts-tertiary',
				label: 'Run This Code',
				onclick: function() {
					that.css.remove('attention');
					that._run();
				}
			});
			this._toolbar.buttons().push({
				visible: false,
				label: 'Revert',
				id: 'button-revert',
				onclick: function() {
					that._editor.dom.remove();
					that._editor = null;
					this.hide();
				}
			});
			this._toolbar.script.run();
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
			if (this._editor) {
				ts.ui.Notification.error(exception.message);
			} else {
				ts.ui.Notification.warning([
					'Script error! Sometimes a snippet depends on a previous ',
					'snippet. If there are other snippets on the page, try ',
					'running them in a different order.'
				].join(''), 'Alrighty');
			}
		}
	},

	/**
	 * Go to edit mode.
	 * @param {ts.ui.ButtonSpirit} button
	 */
	_edit: function() {
		var area = this._editor = ts.ui.TextAreaSpirit.summon();
		var pane = this.dom.q('.tabpanels');
		area.css.add('editcode');
		area.value = this.code;
		this._makeeditor(area);
		area.dom.appendTo(pane);
		area.focus();
		area.element.setSelectionRange(0, 0);
	},

	/**
	 * Draw attention.
	 * @param {boolean} yes
	 * @returns {boolean}
	 */
	_attention: function(yes) {
		if (yes) {
			this.dom.append(
				gui.HTMLParser.parseToNode([
					'<div class="message">',
					'<p>',
					'<i class="ts-icon-arrowleft"></i>',
					'<strong>Interactive time</strong><br/>',
					'Please <code>Run this code</code>',
					'</p>',
					'</div>'
				].join('\n'))
			);
		}
		return yes;
	},

	/**
	 * Make TAB work more or less. Also setup to show the Delete icon on changes.
	 * http://stackoverflow.com/questions/1738808/keypress-in-jquery-press-tab-inside-textarea-when-editing-an-existing-text
	 * TODO: Preserve indent level :/
	 */
	_makeeditor: function(area) {
		var value = area.value;
		var buttons = this._toolbar.buttons();
		$(area.element).keypress(function(e) {
			if (e.keyCode == 9) {
				var myValue = '\t';
				var startPos = this.selectionStart;
				var endPos = this.selectionEnd;
				var scrollTop = this.scrollTop;
				this.value = this.value.substring(0, startPos) + myValue + this.value.substring(endPos, this.value.length);
				this.focus();
				this.selectionStart = startPos + myValue.length;
				this.selectionEnd = startPos + myValue.length;
				this.scrollTop = scrollTop;
				e.preventDefault();
			}
		}).keyup(function() {
			if (value !== null && area.value !== value) {
				buttons.get('button-revert').show();
			}
		});
	}

});
