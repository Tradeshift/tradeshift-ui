/**
 * edb.ObjectProxy.
 */
describe('edb.ObjectProxy', function likethis() {
	var BROADCAST = edb.BROADCAST_ACCESS;
	var TICK = edb.TICK_PUBLISH_CHANGES;

	/*
	 * Testing the feature that enables EDBML temlates to only render
	 * whenever a property is changed that affects the rendering.
	 */
	it('should broadcast when you read a property', function(done) {
		var object = new edb.Object({
			// create an {edb.Object}
			name: 'John'
		});
		// need to add broadcast the listener before we change...
		gui.Broadcast.add(BROADCAST, {
			onbroadcast: function(b) {
				var array = b.data;
				var owner = array[0];
				var pname = array[1];
				if (owner === object && pname === 'name') {
					gui.Broadcast.remove(BROADCAST, this);
					// wait a second (to also test the sync)
					setTimeout(function waitforfail() {
						expect(true).toBe(true);
						done();
					}, 50);
				}
			}
		});
		// will trigger the broadcast *if* edb.$accessaware is true
		edb.$accessaware = true;
		var readTheVariable = object.name; // eslint-disable-line no-unused-vars
		edb.$accessaware = false;
	});

	/*
	 * Testing the (low level) mechanism behind edb.Object.addObserver()
	 * which happens to be implemented using a {gui.Tick}.
	 */
	it('should trigger a tick (async) when you write a property', function(done) {
		// create an edb.Object
		var object = new edb.Object({
			name: 'John'
		});
		// change the property first
		object.name = 'Jim';
		var handler = {
			ontick: function() {
				gui.Tick.remove(TICK, handler);
				expect(true).toBe(true);
				done();
			}
		};
		gui.Tick.add(TICK, handler);
	});

	/*
	 * Nested objects also get passed by the edb.ObjectProxy so that
	 * any changes made can be picked up by observers (EDBML scripts).
	 */
	it('should trigger a tick when you write to a nested edb.Object', function(done) {
		var object = new edb.Object({
			friend: {
				name: 'Anders'
			}
		});
		object.friend.name = 'Svend';
		var handler = {
			ontick: function() {
				gui.Tick.remove(TICK, handler);
				expect(true).toBe(true);
				done();
			}
		};
		gui.Tick.add(TICK, handler);
	});

	/*
	 * If you don't need to observe a data structure, you can bypass the
	 * ObjectProxy altogether by declaring the structure as "simple" data.
	 * This implies that EDBML scripts will not rerender when they change.
	 */
	it('should NOT trigger a tick when you write to a "simple" Object', function(done) {
		var MyClass = edb.Object.extend({
			friend: Object // not an {edb.Object} so no ObjectProxy for this thing...
		});
		var object = new MyClass({
			friend: {
				name: 'Anders'
			}
		});
		var handler = {
			// this should not get triggered
			ontick: function shouldnothappen() {
				expect(false).toBe(true);
			}
		};
		gui.Tick.add(TICK, handler);
		object.friend.name = 'Svend';
		setTimeout(function waitforfail() {
			gui.Tick.remove(TICK, handler);
			expect(true).toBe(true);
			done();
		}, 50);
	});

	/*
	 * This really tests the {gui.Tick} mechanism, but the point here is to say
	 * that multiple changes are reported in one single (bulk) operation.
	 */
	it('should only trigger ONE tick', function(done) {
		var object = new edb.Object({
			name: 'John',
			nickname: 'Henning',
			age: 23
		});
		var sum = 0,
			handler = {
				ontick: function() {
					sum++; // incrementing the counter for every change recorded
				}
			};
		gui.Tick.add(TICK, handler);
		object.name = 'Bob';
		object.nickname = 'Joe';
		object.age = 5;
		setTimeout(function checksum() {
			if (sum === 1) {
				gui.Tick.remove(TICK, handler);
				expect(true).toBe(true);
				done();
			}
		}, 50);
	});
});
