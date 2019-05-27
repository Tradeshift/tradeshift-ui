/**
 * Spirit of the spinner.
 * @param {Object} defaults
 */
ts.ui.SpinnerSpirit = (function using(defaults) {
	/**
	 * @param {Object} [overrides]
	 * @returns {Object}
	 */
	function assign(overrides) {
		return overrides ? gui.Object.extend(defaults, overrides) : defaults;
	}

	return ts.ui.Spirit.extend(
		{
			/**
			 * @param {String} change spinner message
			 */
			text: function(message) {
				var span = this.dom.q('span');
				if (span) {
					span.innerText = message;
				}
			}
		},
		{
			/**
			 * @returns {ts.ui.SpinnerSpirit}
			 */
			summon: function(message, overrides) {
				var outer = document.createElement('div');
				var xxxxx = document.createElement('span');
				var inner = new ts.ui.Spinner(assign(overrides)).spin();
				var tnode = document.createTextNode(message || '');
				xxxxx.appendChild(tnode);
				outer.appendChild(inner.el);
				outer.appendChild(xxxxx);
				return this.possess(outer);
			}
		}
	);
})({
	lines: 12, // The number of lines to draw
	length: 22, // The length of each line
	width: 6, // The line thickness
	radius: 22, // The radius of the inner circle
	scale: 1, // Scales overall size of the spinner
	corners: 1, // Corner roundness (0..1)
	color: '#555', // #rgb or #rrggbb or array of colors
	opacity: 0.5, // Opacity of the lines
	rotate: 0, // The rotation offset
	direction: 1, // 1: clockwise, -1: counterclockwise
	speed: 1, // Rounds per second
	trail: 60, // Afterglow percentage
	fps: 12, // Frames per second when using setTimeout() as a fallback for CSS
	zIndex: 40000, // The z-index (defaults to 4000)
	className: 'ts-spinner-spinner', // The CSS class to assign to the spinner
	top: '0', // Top position relative to parent
	left: '50%', // Left position relative to parent
	shadow: false, // Whether to render a shadow
	hwaccel: true, // Whether to use hardware acceleration
	message: '', // Text under the spinner
	cover: false, // Has a cover,
	position: 'absolute'
});
