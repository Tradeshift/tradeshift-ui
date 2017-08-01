/**
 * Aside API.
 * @param {object|ts.ui.AsideModel} json
 * @returns {ts.ui.AsideModel}
 */
ts.ui.Aside = function(json) {
	var model = ts.ui.AsideModel.syncGlobal(json);
	model.addObserver(ts.ui.Aside);
	return model;
};

/**
 * Identification.
 * @returns {string}
 */
ts.ui.Aside.toString = function() {
	return '[function ts.ui.Aside]';
};

/**
 * API proposal: Close all the asides all over the world (not used yet).
 * TODO: Perhaps scope it to this window (or asides opened by this app)?
 * TODO: Return some kind of Promise here
 */
ts.ui.Aside.closeAll = function() {
	gui.Broadcast.dispatchGlobal(ts.ui.BROADCAST_GLOBAL_ASIDES_DO_CLOSE);
};

// Implementation ..............................................................

/**
 * @using {ts.ui.Greenfield#api} api
 * @using {gui.Object#hidden} hidden
 */
(function using(api, hidden) {
	/**
	 * Get AsideSpirit for model.
	 * @param {ts.ui.AsideModel} model
	 * @return {ts.ui.AsideSpirit}
	 */
	function getspirit(model) {
		var id = getid(model);
		return (
			gui.get('#' + id) ||
			(function() {
				var spirit = ts.ui.AsideSpirit.summon(model);
				document.body.appendChild(spirit.element);
				spirit.element.id = id;
				spirit.onclosed = function() {
					model.isOpen = false;
				};
				return spirit;
			})()
		);
	}

	/**
	 * Get ID for AsideSpirit associated to model.
	 * @param {ts.ui.AsideModel} model
	 * @returns {string};
	 */
	function getid(model) {
		return 'aside-' + (model.id || model.$instanceid);
	}

	/**
	 * Apply method to myself in reverse context.
	 * @param {String} method [description].
	 * @param {object} param
	 */
	function applyreverse(method /* ...params */) {
		var myself = 'ts.ui.Aside';
		var params = [].slice.call(arguments, 1);
		ts.ui.Greenfield.$applyreverse(myself, method, params);
	}

	/**
	 * Toggle model open and closed. Manifest spirit
	 * in the parent frame when model is first opened.
	 * @param {ts.ui.AsideModel} model
	 * @param {boolean} open
	 * @return {ts.ui.AsideModel}
	 */
	function toggle(model, open) {
		if (ts.ui.greenfield) {
			if (open) {
				// TODO (jmo@): This implies that we create a new spirit/model
				// constallation in the parent frame for every open, we should
				// rig it for recycling untill `dispose` is called by the user.
				applyreverse('$open', model.serializeToString());
			} else {
				applyreverse('$close', getid(model));
			}
		} else {
			getspirit(model).open(open);
		}
		return model;
	}

	/**
	 * API methods.
	 */
	gui.Object.extend(ts.ui.Aside, {
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
					case 'disposed':
						var spirit = gui.get('#' + getid(model));
						if (spirit) {
							gui.Tick.time(function() {
								// TODO (jmi@): why otherwise error?
								spirit.dom.remove();
							}, 100);
						}
						break;
				}
			});
		})
	});

	/*
	 * GUI extras.
	 */
	gui.Object.extend(ts.ui.Aside, {
		/*
		 * Open aside in this context.
		 * @param {JSONObject} json
		 */
		$open: hidden(
			api(function(json) {
				var model = ts.ui.Aside(json);
				var spirit = getspirit(model);
				model.addObserver(ts.ui.Aside);
				spirit.open();
			})
		),

		/*
		 * Close aside in this context.
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
})(ts.ui.Greenfield.api, gui.Object.hidden);
