/**
 * Outputting and connecting.
 */
describe('edb.Type.output', function likethis() {
	/**
	 * @param {function} done
	 * @param {boolean} testobject
	 * @param @optional {boolean} testlater
	 * @param @optional {boolean} testdecendant
	 * @param @optional {boolean} testrevoke
	 * @param @optional {boolean} testinstrevoke
	 */
	function doTheTest(done, testobject, testlater, testdecendant, testrevoke, testinstrevoke) {
		// create superclass and subclass
		var AncestorType = testobject ? edb.Object.extend() : edb.Array.extend();
		var DescendantType = AncestorType.extend();

		// testing superclass or subclass?
		var MyType = testdecendant ? DescendantType : AncestorType;
		var mytype = new MyType();

		// create the listener
		var listener = {
			oninput: function(input) {
				if (input.type === MyType) {
					if (testrevoke && input.data === null) {
						expect(true).toBe(true);
						done();
					} else {
						if (input.data === mytype) {
							expect(true).toBe(true);
							done();
						}
					}
				}
			}
		};

		// connect listener before output?
		if (!testlater) {
			AncestorType.output.connect(listener);
		}

		// do the output!
		mytype.output();

		// connect listener after output?
		if (testlater) {
			setTimeout(function muchlater() {
				AncestorType.output.connect(listener);
			}, 500);
		}

		// revoke the output again?
		if (testrevoke) {
			setTimeout(function muchlater() {
				if (testinstrevoke) {
					mytype.revoke();
				} else {
					MyType.output.revoke();
				}
			}, 500);
		}
	}

	it('should connect an output listener', function(done) {
		doTheTest(done, true);
	});

	it('should receive output from the distant past', function(done) {
		doTheTest(done, true, true);
	});

	it('should also receive output from subclass by connecting to superclass', function(done) {
		doTheTest(done, true, false, true);
	});

	it('should transmit null when the output gets revoked', function(done) {
		doTheTest(done, true, false, true, true);
	});

	it('should support output revoke via the instance (not only the Class)', function(done) {
		doTheTest(done, true, false, true, true, true);
	});

	it('should support all of the above for arrays (as well as objects)', function(done) {
		doTheTest(function() {
			doTheTest(
				function() {
					doTheTest(
						function() {
							doTheTest(
								function() {
									doTheTest(done, false, false, true, true, true);
								},
								false,
								false,
								true,
								true
							);
						},
						false,
						false,
						true
					);
				},
				false,
				true
			);
		}, false);
	});
});
