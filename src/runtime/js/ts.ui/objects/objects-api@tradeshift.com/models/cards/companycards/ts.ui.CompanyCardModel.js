/**
 * Advanced company card model.
 * @extends {ts.ui.CardModel}
 * @using {gui.Type} type
 * @using {ts.ui.CompanyCard} Card
 */
ts.ui.CompanyCardModel = (function using(Type, Card) {
	/**
	 * Confirm lookup in (user configurable) array.
	 * @type {number} type
	 * @param {object|string} result
	 */
	function confirm(index, result) {
		if (!Type.isDefined(result)) {
			throw new RangeError(index + ' out of reach');
		}
		return result;
	}

	/**
	 * Lookup connection type.
	 * @param {number} index
	 * @returns {string}
	 */
	function connections(index) {
		return Card.connectionTypes[index];
	}

	/**
	 * Lookup industry.
	 * @param {number} index
	 * @returns {string}
	 */
	function industries(index) {
		return Card.industryTypes[index];
	}

	/**
	 * Lookup company size.
	 * @param {number} index
	 * @returns {string}
	 */
	function sizes(index) {
		return Card.companySizes[index];
	}

	return ts.ui.CardModel.extend({
		/**
		 * Friendly name.
		 */
		item: 'companycard',

		/**
		 * {
		 *	name: null,
		 *	logo: null,
		 *	location: null,
		 *	industry: null,
		 *	size: null,
		 *	connection: null,
		 * }
		 */
		data: Object,

		// Privileged ..............................................................

		/**
		 * Compute text and icon for connection status based on given number.
		 * @see {ts.ui.companycard.edbml}
		 * @returns {object}
		 */
		$computeConnection: function() {
			var type,
				index = this.data.connection;
			if (Type.isDefined(index)) {
				if (Type.isNumber(index)) {
					if ((type = connections(index)) && confirm(index, type)) {
						return {
							text: type[0],
							icon: type[1]
						};
					}
				} else {
					throw new TypeError('The connectionType *must* be a number');
				}
			}
			return null;
		},

		/**
		 * Compute the industry string (based on
		 * hardcoded string or index for lookup).
		 * @see {ts.ui.companycard.edbml}
		 * @returns {string}
		 */
		$computeIndustry: function() {
			var type = this.data.industry;
			switch (Type.of(type)) {
				case 'string':
					return type;
				case 'number':
					return confirm(type, industries(type));
			}
		},

		/**
		 * Compute the company size (based on
		 * hardcoded string or index for lookup).
		 * @see {ts.ui.companycard.edbml}
		 * @returns {string}
		 */
		$computeSize: function() {
			var type = this.data.size;
			switch (Type.of(type)) {
				case 'string':
					return type;
				case 'number':
					return confirm(type, sizes(type));
			}
		},

		// Private .................................................................

		/**
		 * Get EDBML function for this card.
		 * @see {ts.ui.ObjectModel#_edbml}
		 * @returns {function}
		 */
		_edbml: function() {
			return ts.ui.companycard.edbml;
		}
	});
})(gui.Type, ts.ui.CompanyCard);
