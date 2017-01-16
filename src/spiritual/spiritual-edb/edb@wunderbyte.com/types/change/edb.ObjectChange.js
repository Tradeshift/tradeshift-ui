/**
 * edb.Object change summary.
 * @extends {edb.Change}
 * @param {edb.Object} object
 * @param {String} name
 * @param {String} type
 * @param {object} oldval
 * @param {object} newval
 */
edb.ObjectChange = function(object, name, type, oldval, newval) {
	this.object = object;
	this.name = name;
	this.type = type;
	this.oldValue = oldval;
	this.newValue = newval;
};

edb.ObjectChange.prototype = gui.Object.create(edb.Change.prototype, {
	name: null,
	oldValue: undefined,
	newValue: undefined
});

/**
 * We only support type "updated" until
 * native 'Object.observe' comes along.
 * @type {String}
 */
edb.ObjectChange.TYPE_UPDATE = 'update';
