/**
 * Spirit of the form.
 * @extends {ts.ui.Spirit}
 */
ts.ui.FormSpirit = ts.ui.Spirit.extend({

	/**
	 * Add the classname if not already.
	 * TODO: Just-in-time channeling of form spirits whenever the 
	 * form is first initialized (but ONLY the complex selectors 
	 * that rely on markup structure to channel the spirits).
	 */
	onconstruct: function() {
		this.super.onconstruct();
		this.css.add(ts.ui.CLASS_FORM);
		if (!this.element.getAttribute('novalidate')) {
			this.element.setAttribute('novalidate', 'novalidate');
		}
	},

	/**
	 * By default, don't submit to nowhere. This will make it easier 
	 * to setup a clientside form (one that is running on AJAX calls).
	 */
	onconfigure: function() {
		this.super.onconfigure();
		var elm = this.element, method = (elm.method || '').toLowerCase();
		if(elm.localName === 'form' && !elm.action && method !== "post") {
			elm.action = ts.ui.FormSpirit.ACTION_DEFAULT;
		}
	},

	/**
	 * TODO: Can this be privatized (or removed)?
	 * Get or set model. TODO: Figure out how this conflicts 
	 * with a model assigned via {ts.ui.FormSpirit#summon}.
	 * @param {JSONObject|ts.ui.FormModel} model
	 * @returns {ts.ui.FormModel}
	 */
	model: ts.ui.Spirit.createModelMethod(
		ts.ui.FormModel, "ts.ui.FormSpirit.edbml"
	),


	// Private ...................................................................

	/**
	 * Form model.
	 * @type {ts.ui.FormModel}
	 */
	_model: null


}, { // XStatic ................................................................

	/**
	 * First encountered form wil channel additional spirits 
	 * in order to keep element selector matching at a minimum.
	 * TODO(jmo@): this is currently not really used...
	 * @type {boolean}
	 */
	channeled: false,

	/**
	 * Summon spirit.
	 * @param {ts.ui.FormModel=} opt_model
	 * @return {ts.ui.FormSpirit}
	 */
	summon: function(model) {
		var spirit = this.possess(
			gui.HTMLParser.parse(
				ts.ui.form.edbml()
			)
		);
		if(model){
			spirit.render(model);
		}
		return spirit;
	}


}, { // Static .................................................................

	/**
	 * Default form 'action' attribute value so that the form 
	 * never accidentally submits to the page it's running on. 
	 * If you do need that, you must declare <form action="">.
	 * @type {string}
	 */
	ACTION_DEFAULT: gui.IframeSpirit.SRC_DEFAULT

});
