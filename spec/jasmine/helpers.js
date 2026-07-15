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

/*
 * Test DOMs created via helper.createTestDom(), removed after each spec.
 * NOTE: we must NOT call afterEach() from inside createTestDom — Jasmine 5
 * only allows afterEach during declaration, not while a spec is running. So we
 * track the elements here and remove them in the single global afterEach below.
 */
var testdoms = [];

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
		testdoms.push(main);
		return main;
	},

	gethtml: function(html) {
		var dom = this.createTestDom();
		dom.innerHTML = html;
		return dom.innerHTML;
	}
};

/*
 * Global cleanup — declared once (valid in Jasmine 5), runs after every spec
 * to remove any test DOMs created during it.
 */
afterEach(function cleanupTestDoms() {
	testdoms.forEach(function(main) {
		if (main.parentNode === document.body) {
			document.body.removeChild(main);
		}
	});
	testdoms.length = 0;
});
