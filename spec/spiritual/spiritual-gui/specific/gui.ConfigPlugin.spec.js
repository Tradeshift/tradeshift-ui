/**
 * The config plugin matches prefixed DOM attributes
 * to property setters and method calls on the spirit.
 */
describe('ts.ConfigPlugin', function likethis() {
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
	var TestSpirit = gui.Spirit.extend({
		stringvalue: -1,
		numbervalue: -1,
		booleanvalue: -1,
		stringmethod: function(value) {
			this.stringvalue = value;
		},
		numbermethod: function(value) {
			this.numbervalue = value;
		},
		booleanmethod: function(value) {
			this.booleanvalue = value;
		}
	});

	// Expectations ..............................................................

	it('should work with a data-ts.prefixed attribute', function() {
		var spirit = TestSpirit.summon();
		var element = spirit.element;
		this.sandbox.appendChild(element);
		element.setAttribute('data-ts.stringmethod', 'twentythree');
		expect(spirit.stringvalue).toBe('twentythree');
	});

	it('should work with a custom.prefixed attribute', function() {
		gui.attributes.push('custom');
		var spirit = TestSpirit.summon();
		var element = spirit.element;
		this.sandbox.appendChild(element);
		element.setAttribute('custom.stringmethod', 'twentyfour');
		expect(spirit.stringvalue).toBe('twentyfour');
	});

	it('should autocast numbers', function() {
		var spirit = TestSpirit.summon();
		var element = spirit.element;
		this.sandbox.appendChild(element);
		element.setAttribute('data-ts.numbermethod', '23');
		expect(spirit.numbervalue).toBe(23);
	});

	it('should autocast booleans', function() {
		var spirit = TestSpirit.summon();
		var element = spirit.element;
		this.sandbox.appendChild(element);
		element.setAttribute('data-ts.booleanmethod', 'true');
		expect(spirit.booleanvalue).toBe(true);
	});

	it('should also work with properties (instead of methods)', function() {
		var spirit = TestSpirit.summon();
		var element = spirit.element;
		this.sandbox.appendChild(element);
		element.setAttribute('data-ts.booleanvalue', 'false');
		expect(spirit.booleanvalue).toBe(false);
	});
});
