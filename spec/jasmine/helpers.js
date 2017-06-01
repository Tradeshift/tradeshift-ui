/*
 * Flag to trigger tests where spirits confirm that they are 
 * assigned to the correct element type and stuff like that.
 */
gui.debug = true;

/**
 * Async sugar. Having a somewhat big timeout for now until we get time 
 * to adjust it to whatever minimum the {gui.DOMObserver} demands. Note 
 * that eventually all spirits should and will attach synchronously, but 
 * currently they aren't because of the some kind of Chromium issue.
 * @see http://code.google.com/p/chromium/issues/detail?id=13175
 * @param {function} later
 * @param @optional {object} thisp
 */
window.sometime = function(later, thisp) {
	setTimeout(function() {
		later.call(thisp);
	}, 500);
};

window.helper = {
	/**
	 * Create an element to conduct tests within.
	 * @param @optional {constructor} Spirit Optionally append a spirit here
	 */
	createTestDom: function(Spirit) {
		var main = document.body.appendChild(document.createElement('main'));
		main.className = 'ts-main';
		if (Spirit) {
			var spirit = Spirit.summon();
			spirit.dom.appendTo(main);
		}
		afterEach(function cleanup() {
			if (main.parentNode === document.body) {
				document.body.removeChild(main);
			}
		});
		return main;
	},

	gethtml: function(html) {
		var dom = this.createTestDom();
		dom.innerHTML = html;
		return dom.innerHTML;
	}
};
