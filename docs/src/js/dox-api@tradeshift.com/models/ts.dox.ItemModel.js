/**
 * Menu item model.
 */
ts.dox.ItemModel = ts.ui.Model.extend({
	label: null,
	icon: null,
	hidden: false,
	open: false,
	selected: false
});

/*
 * Recursive structure goes here
 */
ts.dox.ItemModel.prototype.items = ts.ui.Collection.extend({
	$of: ts.dox.ItemModel
});
