/**
 * The config plugin matches prefixed DOM attributes
 * to property setters and method calls on the spirit.
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

	/**
	 * Spirit of the test.
	 */
	// eslint-disable-next-line no-unused-vars
	var TestSpirit = gui.Spirit.extend({
		done: function() {
			// implemented by the test...
		},
		onenter: function() {
			gui.Spirit.prototype.onenter.call(this);
			this.element.style.opacity = 1;
			this.css.style({
				'-beta-transition-property': 'opacity',
				'-beta-transition-duration': '0.1s'
			});
		},
		fadeOut: function() {
			/*
			 * Important: The transitionend listener MUST NOT be added
			 * in the same execution stack as the transition procedure.
			 * Perhaps reintroduce transition lib from SPIRITUAL-MIX???
			 */
			this.event.add('transitionend');
			this.tick.next(function becauseBrowserFail() {
				this.element.style.opacity = 0;
			});
		},
		onevent: function(e) {
			gui.Spirit.prototype.onevent.call(this, e);
			if (e.type === 'transitionend') {
				this.done();
			}
		}
	});

	// Expectations ..............................................................

	/*
	 * THIS TEST AINT WORKING RIGHT!
	 *
	it('should just work', function(done) {
		var spirit = TestSpirit.summon();
		this.sandbox.appendChild(spirit.element);
		spirit.done = done;
		spirit.fadeOut();
	});
	*/
});
