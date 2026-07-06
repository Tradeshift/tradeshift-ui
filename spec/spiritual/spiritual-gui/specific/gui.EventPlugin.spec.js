/**
 * The EventPlugin subscribes a spirit to DOM events (via `this.event.add`)
 * and routes them to the spirit's `onevent` handler.
 */
describe('gui.EventPlugin', function likethis() {
	// Preparations ..............................................................

	/**
	 * Before test.
	 */
	beforeEach(function() {
		this.sandbox = document.createElement('main');
		document.body.appendChild(this.sandbox);
	});

	/**
	 * After test.
	 */
	afterEach(function() {
		this.sandbox.parentNode.removeChild(this.sandbox);
	});

	// Expectations ..............................................................

	/*
	 * Subscribe a spirit to `click` and confirm the plugin routes the DOM
	 * event to `onevent`. (Replaces an old transitionend test that was flaky
	 * because it depended on CSS transition timing.)
	 */
	it('should route a subscribed DOM event to onevent', function(done) {
		var received = null;
		var TestSpirit = gui.Spirit.extend({
			onenter: function() {
				gui.Spirit.prototype.onenter.call(this);
				this.event.add('click');
			},
			onevent: function(e) {
				gui.Spirit.prototype.onevent.call(this, e);
				received = e;
			}
		});
		var spirit = TestSpirit.summon();
		this.sandbox.appendChild(spirit.element);
		sometime(function later() {
			spirit.element.click();
			sometime(function evenlater() {
				expect(received).not.toBe(null);
				expect(received.type).toBe('click');
				done();
			});
		});
	});
});
