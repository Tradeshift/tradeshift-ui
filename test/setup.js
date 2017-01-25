/* global describe, it, expect, spyOn, beforeEach, afterEach, jasmine, helper */
(function testSetup() {
	// Delay starting the tests until after the document is ready, as Spiritual waits for that.
	var oldStart = window.__karma__.start;
	window.__karma__.start = function() {
		gui.debug = true;
		document.addEventListener('DOMContentLoaded', function() {
			setTimeout(oldStart, 5000); // huh?
		}, false);
	};

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
		}, gui.Client.isExplorer ? 250 : 100);
	};

	window.helper = {
		// @param @optional {constructor} Spirit
		createTestDom: function(Spirit) {
			var main = document.body.appendChild(
				document.createElement('main')
			);
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
}());
