/**
 * Spirit of the tooltip.
 * @extends {ts.ui.Spirit}
 * @using {gui.Client} Client
 * @using {gui.CSSPlugin} CSSPlugin
 */
ts.ui.TooltipSpirit = (function using(Client, CSSPlugin) {
	return ts.ui.Spirit.extend({
		/**
		 * The content of the tooltip.
		 * @type {string}
		 */
		title: '',

		/**
		 * The adjustment of left.
		 * For exampe 10 or -5
		 * @type {number}
		 */
		left: 0,

		/**
		 * The adjustment of top.
		 * For exampe 10 or -5
		 * @type {number}
		 */
		top: 0,

		/**
		 * Set id and add mosemove event.
		 */
		onconstruct: function() {
			this.super.onconstruct();
			if (!this.element.id) {
				this.element.id = this.sprite.$instanceid;
			}
			this.event.add('mousemove', this.element, this, true);
		},

		/**
		 * Handle event. mouse over set the right position of the tooltip.
		 * Adjust x and y by the setting of atrribute.
		 * @param {Event} e
		 */
		onevent: function(e) {
			this.super.onevent(e);
			if (e.type === 'mousemove') {
				var x = e.pageX + parseInt(this.left);
				var y = e.pageY + parseInt(this.top);
				this._pseudoStyle(x, y);
			}
		},

		// Private ........................................................................................................

		/**
		 * Set the pseudo style,
		 * We need to create a style element in head.
		 * Set the top and left of the tooltips :before
		 */
		_pseudoStyle: function(x, y) {
			var selector = '#' + this.element.id;
			var element = document.querySelector(selector);
			var head = document.head || document.getElementsByTagName('head')[0];
			var styleId = 'pseudoStyles';
			var style = document.getElementById(styleId);
			if (style) {
				style.parentNode.removeChild(style);
			}
			style = document.createElement('style');
			style.id = styleId;
			var width = parseInt(window.getComputedStyle(element, ':before').width);
			var height = parseInt(window.getComputedStyle(element, ':before').height);
			var left = x + 10 + 'px';
			var top = y + 10 + 'px';
			if (!Client.isExplorer) {
				left =
					x + width + Client.scrollBarSize + 10 < document.body.clientWidth
						? x + 10 + 'px'
						: document.body.clientWidth - Client.scrollBarSize - width + 'px';
				top =
					y + height + 10 < document.body.clientHeight
						? y + 10 + 'px'
						: document.body.clientHeight - height + 'px';
			}
			style.innerHTML = selector + ':before{left:' + left + ';top:' + top + '}';
			head.appendChild(style);
		}
	});
})(gui.Client, gui.CSSPlugin);
