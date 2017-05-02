/**
 * Utilities for the {edbml.UpdateManager}.
 */
edbml.UpdateAssistant = {
	/**
	 * Parse markup to element.
	 * TODO: Use DOMParser versus "text/html" for browsers that support it?
	 * TODO: All sorts of edge cases for IE6 compatibility. Hooray for HTML5.
	 * TODO: Evaluate well-formedness in debug mode for XHTML documents.
	 * @param {String} markup
	 * @param {String} id
	 * @param {Element} element
	 * @returns {Element}
	 */
	parse: function(markup, id, element) {
		// gonna need to know the parent element type here...
		/*
		 * TODO: run this by the gui.HTMLParser for maximum backwards lameness with TABLE and friends
		 */
		element = document.createElement(element.localName);
		element.innerHTML = markup;
		element.id = id;
		// TODO: Plugin this!
		Array.forEach(element.querySelectorAll('option'), function(option) {
			switch (option.getAttribute('selected')) {
				case 'true':
					option.setAttribute('selected', 'selected');
					break;
				case 'false':
					option.removeAttribute('selected');
					break;
			}
		});
		// TODO: Plugin this!
		var inputs = 'input[type=checkbox],input[type=radio]';
		Array.forEach(element.querySelectorAll(inputs), function(option) {
			switch (option.getAttribute('checked')) {
				case 'true':
					option.setAttribute('checked', 'checked');
					break;
				case 'false':
					option.removeAttribute('checked');
					break;
			}
		});
		return element;
	},

	/**
	 * Mapping element id to it's ordinal position.
	 * @returns {Map<String,number>}
	 */
	order: function(nodes) {
		var order = {};
		Array.forEach(
			nodes,
			function(node, index) {
				if (node.nodeType === Node.ELEMENT_NODE) {
					order[node.id] = index;
				}
			},
			this
		);
		return order;
	},

	/**
	 * Convert an NodeList into an ID-to-element map.
	 * @param {NodeList} nodes
	 * @return {Map<String,Element>}
	 */
	index: function(nodes) {
		var result = Object.create(null);
		Array.forEach(
			nodes,
			function(node, index) {
				if (node.nodeType === Node.ELEMENT_NODE) {
					result[node.id] = node;
				}
			},
			this
		);
		return result;
	}
};
