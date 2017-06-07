/**
 * Advanced image model.
 */
ts.ui.ImageModel = (function() {
	var BLANK =
		'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAQAAAAngNWGAAAAFElEQVR42mNkIBIwjiocVTiqEAQAJNYAFd868w4AAAAASUVORK5CYII=';
	return ts.ui.Model.extend(
		{
			/**
			 * The image URL.
			 * @type {string}
			 */
			src: BLANK,

			/**
			 * Optional ALT text.
			 * @type {string}
			 */
			alt: '',

			/**
			 * The image width.
			 * @type {number}
			 */
			width: 0,

			/**
			 * The image height.
			 * @type {number}
			 */
			height: 0,

			/**
			 * Render as `background-image` for enhanced image processing via CSS?
			 * @type {boolean}
			 */
			background: false,

			/**
			 * Used for sorting (in the Table).
			 * @type {string|number}
			 */
			value: null,

			/**
			 * Confirm dimensions. We'll render all images with a fixed size
			 * so that the page doesn't jump around when the images are loaded.
			 */
			onconstruct: function() {
				this.super.onconstruct();
				if (!this.width || !this.height) {
					throw new Error('Image must have both width and height');
				}
			},

			/**
			 * Bounce model to HTML.
			 * @returns {string}
			 */
			render: function() {
				return ts.ui.image.edbml(this);
			}
		},
		{
			// Static ...............................................................

			/**
			 * For anyone else who might like a 20x20 blank PNG.
			 * @type {string}
			 */
			BLANK: BLANK
		}
	);
})();
