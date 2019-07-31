/**
 * Dialog API.
 * @param {object|ts.ui.DialogModel} opt_json
 * @return {ts.ui.DialogModel}
 */
ts.ui.Dialog = function(opt_json) {
	var model = ts.ui.DialogModel.syncGlobal(opt_json);
	model.addObserver(ts.ui.Dialog);
	return model;
};

/**
 * Identification.
 * @return {string}
 */
ts.ui.Dialog.toString = function() {
	return '[function ts.ui.Dialog]';
};

/**
 * Confirmation dialog.
 * @returns {ts.ui.DialogModel}
 */
ts.ui.Dialog.confirm = function(/* ...args */) {};

/**
 * Severe confirmation dialog.
 * @returns {ts.ui.DialogModel}
 */
ts.ui.Dialog.warning = function(/* ...args */) {};

/**
 * Cataclysmic confirmation dialog.
 * @returns {ts.ui.DialogModel}
 */
ts.ui.Dialog.danger = function(/* ...args */) {};

/**
 * Absolute minimum time to display a
 * dialog with no buttons to close it.
 * @type {number} Time in milliseconds
 */
ts.ui.Dialog.DEFAULT_TIME = 1500;

// Implementation ..............................................................

/**
 * @using {ts.ui.Greenfield#api} api
 * @using {gui.Combo#chained} chained
 * @using {gui.Object#hidden} hidden
 * @using {gui.Array} GuiArray
 * @using {gui.Object} GuiObject
 * @using {gui.Type} Type
 */
(function using(api, chained, hidden, GuiArray, GuiObject, Type) {
	var Dialog = ts.ui.Dialog;

	/**
	 * Get spirit for model.
	 * TODO (jmo@): Look into {ts.ui.Aside} for possible method sharing
	 * @param {ts.ui.DialogModel} model
	 * @return {ts.ui.DialogSpirit}
	 */
	function getspirit(model) {
		var id = model.$instanceid;
		return (
			gui.get('#' + id) ||
			(function() {
				var spirit = ts.ui.DialogSpirit.summon(model);
				spirit.dom.id(id).appendTo(document.body);
				return spirit;
			})()
		);
	}

	/**
	 * Apply method to myself in reverse context.
	 * @param {String} method [description].
	 * @param {object} param
	 */
	function applyreverse(method /* ...params */) {
		var myself = 'ts.ui.Dialog';
		var params = [].slice.call(arguments, 1);
		ts.ui.Greenfield.$applyreverse(myself, method, params);
	}

	/**
	 * Toggle model open and closed. Manifest spirit when model is first opened.
	 * @param {ts.ui.DialogModel} model
	 * @param {boolean} open
	 * @return {ts.ui.DialogModel}
	 */
	function toggle(model, open) {
		if (ts.ui.greenfield) {
			if (open) {
				// TODO (jmo@): This implies that we create a new spirit/model
				// constallation in the parent frame for every open, we should
				// rig it for recycling untill `dispose` is called by the user.
				applyreverse('$open', model.serializeToString());
			} else {
				applyreverse('$close', model.$instanceid);
			}
		} else {
			getspirit(model).open(open);
		}
		return model;
	}

	/**
	 * Get argument of object type. Always return an object.
	 * @param {Arguments} args
	 * @returns {<object>}
	 */
	function extractobject(args) {
		return GuiArray.from(args).find(Type.isObject) || {};
	}

	/**
	 * Get list of string-type arguments.
	 * @param {Arguments} args
	 * @return {Array<string>}
	 */
	function extractstring(args) {
		return GuiArray.from(args).filter(gui.Type.isString);
	}

	/**
	 * Never write "undefined" on screen and
	 * don't show buttons with an empty label.
	 * @param {string} string
	 * @returns {string}
	 */
	function tostring(string) {
		return string ? String(string) : undefined;
	}

	/**
	 * @param {Arguments} args
	 */
	function getdialog(type, args, note) {
		var dialog = getmodel(type, note || false, extractstring(args), extractobject(args));
		dialog.open();
		return dialog;
	}

	/**
	 * Build the DialogModel. Notifications don't have
	 * cancel. The success notifications has nothing.
	 * Dialogs with no buttons will close automatically.
	 * @param {string} type
	 * @param {boolean} note
	 * @param {Array<string>} strings
	 * @param {object} config
	 * @returns {ts.ui.DialogModel}
	 */
	function getmodel(type, note, strings, config) {
		return Dialog(
			GuiObject.extendmissing(config, {
				type: type,
				icon: geticon(type),
				items: [
					{
						item: 'text',
						text: tostring(strings[0])
					}
				]
			})
		)
			.acceptButton(type === Dialog.SUCCESS ? null : { label: tostring(strings[1]) })
			.cancelButton(note ? null : { label: tostring(strings[2]) })
			.customButtons(config.actions ? config.actions : []);
	}

	/**
	 * Get icon for type.
	 * @param {string} type
	 * @returns {string}
	 */
	function geticon(type) {
		switch (type) {
			case Dialog.SUCCESS:
				return 'ts-icon-accept';
			case Dialog.INFO:
				return 'ts-icon-info';
			case Dialog.WARNING:
				return 'ts-icon-warning';
			case Dialog.ERROR:
				return 'ts-icon-remove';
			case Dialog.DANGER:
				return 'ts-icon-remove';
			case Dialog.CONFIRM:
				return 'ts-icon-question';
		}
		return null;
	}

	/**
	 * API methods.
	 */
	GuiObject.extend(Dialog, {
		/*
		 * Dialog types. Note that some of these should
		 * be considered like {ts.ui.Notification} types.
		 */
		INFO: 'ts-dialog-info',
		SUCCESS: 'ts-dialog-success',
		WARNING: 'ts-dialog-warning',
		ERROR: 'ts-dialog-error',
		DANGER: 'ts-dialog-danger',
		CONFIRM: 'ts-dialog-confirm',

		/**
		 * Handle (model) changes.
		 * TODO(jmo@): move this handler out of {ts.ui.Dialog} methods
		 * @param {Array<gui.Change>} changes
		 */
		onchange: hidden(function(changes) {
			changes.forEach(function(c) {
				var model = c.object;
				switch (c.name) {
					case 'isOpen':
						toggle(model, c.newValue);
						break;
					case 'disposed':
						if (!ts.ui.greenfield) {
							var spirit = gui.get('#' + model.$instanceid);
							if (spirit) {
								gui.Tick.time(function() {
									// TODO (jmo@): why otherwise error?
									spirit.dom.remove();
								}, 100);
							}
						}
						break;
				}
			});
		})
	});

	/**
	 * GUI extras.
	 */
	GuiObject.extend(Dialog, {
		/**
		 * Launch confirm dialog.
		 * @returns {ts.ui.DialogModel}
		 */
		confirm: chained(
			api(function(/* ...args */) {
				return getdialog(this.CONFIRM, arguments);
			})
		),

		/**
		 * Launch dangerous dialog.
		 * @returns {ts.ui.DialogModel}
		 */
		warning: chained(
			api(function(/* ...args */) {
				return getdialog(this.WARNING, arguments);
			})
		),

		/**
		 * Launch dangerous dialog.
		 * @returns {ts.ui.DialogModel}
		 */
		danger: chained(
			api(function(/* ...args */) {
				return getdialog(this.DANGER, arguments);
			})
		),

		// Privileged ..............................................................

		/**
		 * Exposed for Notifications to use.
		 * @param {string} type
		 * @param {Arguments} args
		 * @param @optional {boolean} note
		 * @returns {ts.ui.DialogModel}
		 */
		$getdialog: hidden(
			api(function(type, args, note) {
				return getdialog(type, args, note);
			})
		),

		/*
		 * Open dialog in this context.
		 * @param {JSONObject} json
		 */
		$open: hidden(
			api(function(json) {
				var model = Dialog(json);
				var spirit = getspirit(model);
				spirit.open();
			})
		),

		/*
		 * Close dialog in this context.
		 * @param {string} id
		 */
		$close: hidden(
			api(function(id) {
				var spirit = gui.get('#' + id);
				if (spirit && spirit.isOpen) {
					spirit.close();
				}
			})
		)
	});
})(ts.ui.Greenfield.api, gui.Combo.chained, gui.Object.hidden, gui.Array, gui.Object, gui.Type);
