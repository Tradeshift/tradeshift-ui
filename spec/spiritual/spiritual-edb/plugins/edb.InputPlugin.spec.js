/**
 * Outputting and connecting.
 */
describe('edb.InputPlugin', function likethis() {
	var BaseType = edb.Object.extend(); // superclass
	var DerivedType = BaseType.extend(); // subclass

	afterEach(function cleanupOutput() {
		BaseType.output.revoke();
		DerivedType.output.revoke();
	});

	/**
	 * someinstance.output() will trigger the oninput() of all connected spirits.
	 * The argument is a {edb.Input} object whose `data` points to that instance.
	 */
	it('should connect to the output', function(done) {
		var base,
			spirit = gui.Spirit.summon();
		spirit.oninput = function(input) {
			expect(input.type).toBe(BaseType);
			expect(input.data).toBe(base);
			this.input.disconnect(BaseType);
			done();
		};
		spirit.input.connect(BaseType);
		base = new BaseType();
		base.output();
	});

	/**
	 * You can `get()` the latest input of a certain Type (if it's there).
	 */
	it("should .get() the output (after it's receieved)", function(done) {
		var base,
			spirit = gui.Spirit.summon();
		spirit.oninput = function() {
			expect(this.input.get(BaseType)).toBe(base);
			this.input.disconnect(BaseType);
			done();
		};
		spirit.input.connect(BaseType);
		base = new BaseType();
		base.output();
	});

	/**
	 * Make sure we can also disconnect from a Type's output
	 */
	it('should disconnect from the output', function() {
		var base,
			spirit = gui.Spirit.summon();
		spirit.input.connect(BaseType);
		spirit.input.disconnect(BaseType);
		base = new BaseType();
		base.output();
		expect(spirit.input.get(BaseType)).toBe(null);
	});

	/**
	 * Once disconnected, we can't `get()` the input like we used to
	 */
	it('should disconnect from the output', function(done) {
		var base1,
			base2,
			spirit = gui.Spirit.summon();
		spirit.input.connect(BaseType); // connect...
		spirit.oninput = function() {
			expect(this.input.get(BaseType)).toBe(base1);
			this.input.disconnect(BaseType);
			base2 = new BaseType();
			base2.output();
			this.tick.time(function later() {
				expect(this.input.get(BaseType)).toBe(null);
				done();
			});
		};
		base1 = new BaseType();
		base1.output();
		expect(spirit.input.get(BaseType)).toBe(null);
	});

	it('should connect to derived classes automatically', function(done) {
		var derived,
			spirit = gui.Spirit.summon();
		spirit.oninput = function(input) {
			expect(input.data).toBe(derived);
			expect(input.type).toBe(DerivedType);
			// expect(input.connection).toBe(BaseType); TODO: also support this prop!
			this.input.disconnect(BaseType);
			done();
		};
		spirit.input.connect(BaseType);
		derived = new DerivedType();
		derived.output();
	});
});
