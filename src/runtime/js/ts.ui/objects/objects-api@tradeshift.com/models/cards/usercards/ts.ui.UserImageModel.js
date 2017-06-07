/**
 * Advanced user image model.
 */
ts.ui.UserImageModel = ts.ui.Model.extend({
	/**
	 * The user name. If no image exists, an
	 * image will be autogenerated based on this.
	 * @type {string}
	 */
	name: '',

	/**
	 * User photo or avatar.
	 * @type {string}
	 */
	src: '',

	/**
	 * Image dimension. Zero implies default (44px).
	 * @type {number}
	 */
	size: 0,

	/**
	 * Used for sorting (in the Table).
	 * @type {string|number}
	 */
	value: null,

	/**
	 * Bounce model to HTML.
	 * @returns {string}
	 */
	render: function() {
		return ts.ui.userimage.edbml(this);
	}
});
