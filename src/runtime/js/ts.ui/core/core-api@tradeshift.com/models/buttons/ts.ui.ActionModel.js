/**
 * Advanced action model.
 * @extends {ts.ui.ButtonModel}
 */
ts.ui.ActionModel = ts.ui.ButtonModel.extend({
	/**
	 * Is indeed an action? Not to be confused with the Button's `action` property
	 * (which indicates the string type of `gui.Action` to dispatch when clicked).
	 * TODO: Rename other property to `actiontype` or something like that...
	 * @type {boolean}
	 */
	isAction: true
});
