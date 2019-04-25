/**
 * DatePicker API.
 * @param {object|ts.ui.DatePickerModel} json
 * @return {ts.ui.DatePickerModel}
 */
ts.ui.DatePicker = function(json) {
	var model = ts.ui.DatePickerModel.syncGlobal(json);
	model.addObserver(ts.ui.DatePicker);
	return model;
};

/**
 * Identification.
 * @return {string}
 */
ts.ui.DatePicker.toString = function() {
	return '[function ts.ui.DatePicker]';
};

/**
 * Ad-hoc localization interface. Omit the
 * argument to get the current localization.
 * TODO: Greenfield this (add xframe support).
 * @param @optional {Object} config
 * @returns {Object}
 */
ts.ui.DatePicker.localize = function(config) {};

// Implementation ..............................................................

/**
 * @using {ts.ui.Greenfield#api} api
 * @using {gui.Object#hidden} hidden
 */
(function DatePicker(api, hidden) {
	var asides = {};
	var locale = null;

	/**
	 * Toggle model open and closed.
	 * @param {ts.ui.DatePickerModel} model
	 * @param {boolean} open
	 * @return {ts.ui.DatePickerModel}
	 */
	function toggle(model, open) {
		var aside,
			id = model.$instanceid;
		var deselect = {
			label: ts.ui.DatePicker.localize().deselect,
			type: 'ts-secondary',
			onclick: function() {
				model.value = '';
			}
		};
		if (!model.value) {
			deselect.disabled = 'disabled';
		}
		var footer = model.deselectable ? ts.ui.Buttons({ items: [deselect] }) : null;
		if (open) {
			asides[id] = (
				asides[id] ||
				ts.ui.Aside({
					title: model.title,
					items: [model],
					note: model.note,
					footer: footer,
					onclosed: function() {
						if (gui.Type.isFunction(model.onclosed)) {
							model.onclosed();
						}
						model.isOpen = false;
					}
				})
			).open();
		} else {
			if ((aside = asides[id])) {
				gui.Tick.time(function() {
					// allow user to percieve the update...
					aside.close();
				}, 100);
			}
		}
		return model;
	}

	gui.Object.extend(ts.ui.DatePicker, {
		/**
		 * Localize. Note that this stuff has NOT been
		 * rigged up for xframe (Greenfield) support.
		 * @param {object} newlocale
		 */
		localize: function(newlocale) {
			if (arguments.length) {
				if (
					!locale ||
					Object.keys(locale).every(function(key) {
						var has = newlocale.hasOwnProperty(key);
						if (!has) {
							console.error('Missing translations for ' + key);
						}
						return has;
					})
				) {
					locale = newlocale;
				}
			} else {
				return locale;
			}
		},

		/**
		 * Handler changes.
		 * @param {Array<gui.Change>} changes
		 */
		onchange: hidden(function(changes) {
			changes.forEach(function(c) {
				var model = c.object;
				switch (c.name) {
					case 'isOpen':
						toggle(model, c.newValue);
						break;
					case 'disposed': // TODO (jmo@): automate this
						model.removeObserver(ts.ui.DatePicker);
						var aside = asides[model.$instanceid];
						if (aside) {
							delete asides[model.$instanceid];
							aside.dispose();
						}
						break;
				}
			});
		})
	});
})(ts.ui.Greenfield.api, gui.Object.hidden);

/**
 * Default-localize the DatePicker. We don't yet use
 * all of these strings, but we might need them for
 * tooltips and quick-select-menus (in the future).
 */
ts.ui.DatePicker.localize({
	/**
	 * The first is always the worst.
	 * @type {number}
	 */
	firstDay: 1,

	/**
	 * Months of the year. How many do you know?
	 * @type {Array<string>}
	 */
	monthNames: [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December'
	],

	/**
	 * Short months.
	 * @type {Array<string>}
	 */
	monthNamesShort: [
		'Jan',
		'Feb',
		'Mar',
		'Apr',
		'May',
		'Jun',
		'Jul',
		'Aug',
		'Sep',
		'Oct',
		'Nov',
		'Dec'
	],

	/**
	 * Day names.
	 * @type {Array<string>}
	 */
	dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],

	/**
	 * Short day names.
	 * @type {Array<string>}
	 */
	dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],

	/**
	 * Compact day names.
	 * @type {Array<string>}
	 */
	dayNamesMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],

	/**
	 * Deselect button label.
	 * @type {string}
	 */
	deselect: 'Deselect'
});
