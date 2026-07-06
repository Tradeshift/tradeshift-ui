/**
 * Basic AppSpirit coverage.
 *
 * NOTE: the busy/blocking spinner moved here from Main (see ts.ui.MainSpirit.js),
 * but exercising it reliably needs a full app frame — in an isolated test the
 * cover/spinner machinery races and throws. Proper spinner coverage is deferred
 * to the coverage-gap work (with running verification) rather than guessed here.
 */
describe('ts.ui.AppSpirit', function likethis() {
	it('should (eventually) channel via ts-attribute', function(done) {
		var dom = helper.createTestDom();
		dom.innerHTML = '<div data-ts="App"></div>';
		sometime(function later() {
			var spirit = ts.ui.get(dom.querySelector('.ts-app'));
			expect(spirit.constructor).toBe(ts.ui.AppSpirit);
			done();
		});
	});
});
