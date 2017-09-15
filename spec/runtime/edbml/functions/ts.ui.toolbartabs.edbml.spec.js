describe('ts.ui.toolbartabs.edbml', function likethis() {
	function gethtml(spirit, tabs, id, mobile) {
		return ts.ui.toolbartabs.edbml(spirit, tabs, id, mobile);
	}

	it('should contain ts-toolbar-tabs', function() {
		var spirit = {},
			tabs = [],
			id = 'test',
			mobile = false;
		expect(gethtml(spirit, tabs, id, mobile)).toContain('ts-toolbar-tabs');
		expect(gethtml(spirit, tabs, id, mobile)).not.toContain('ts.ui.TopBarTabsSpirit');
		expect(gethtml(spirit, tabs, id, mobile)).toContain('ts-tab');
	});

	it('should contain ts-tab', function() {
		var spirit = {},
			tabs = [{}],
			id = 'test',
			mobile = false;
		expect(gethtml(spirit, tabs, id, mobile)).toContain('ts-tab');
	});

	it('should contain ts-selected', function() {
		var spirit = {},
			tabs = [{ selected: true }],
			id = 'test',
			mobile = false;
		expect(gethtml(spirit, tabs, id, mobile)).toContain('ts-selected');
	});

	it('should not contain ts-selected', function() {
		var spirit = {},
			tabs = [{ selected: false }],
			id = 'test',
			mobile = false;
		expect(gethtml(spirit, tabs, id, mobile)).not.toContain('ts-selected');
	});

	it('should contain ts-counter', function() {
		var spirit = {},
			tabs = [{ counter: 2 }],
			id = 'test',
			mobile = false;
		expect(gethtml(spirit, tabs, id, mobile)).toContain('ts-counter');
		expect(gethtml(spirit, tabs, id, mobile)).toContain('<em>2</em>');
	});

	it('should not contain ts-counter', function() {
		var spirit = {},
			tabs = [{ counter: 0 }],
			id = 'test',
			mobile = false;
		expect(gethtml(spirit, tabs, id, mobile)).not.toContain('ts-counter');
	});

	it('should contain ts-tab-close', function() {
		var spirit = {},
			tabs = [{ selected: true, closeable: true }],
			id = 'test',
			mobile = false;
		expect(gethtml(spirit, tabs, id, mobile)).toContain('ts-tab-close');
	});

	it('should not contain ts-tab-close', function() {
		var spirit = {},
			tabs = [{ selected: false, closeable: true }],
			id = 'test',
			mobile = false;
		expect(gethtml(spirit, tabs, id, mobile)).not.toContain('ts-tab-close');
	});

	it('should not contain ts-tab-close', function() {
		var spirit = {},
			tabs = [{ selected: true, closeable: false }],
			id = 'test',
			mobile = false;
		expect(gethtml(spirit, tabs, id, mobile)).not.toContain('ts-tab-close');
	});

	it('should not contain ts-tab-close', function() {
		var spirit = {},
			tabs = [{ selected: false, closeable: false }],
			id = 'test',
			mobile = false;
		expect(gethtml(spirit, tabs, id, mobile)).not.toContain('ts-tab-close');
	});

	it('should contain ts-tab-icon', function() {
		var spirit = {},
			tabs = [{ icon: 'icon' }],
			id = 'test',
			mobile = false;
		expect(gethtml(spirit, tabs, id, mobile)).toContain('ts-tab-icon');
	});

	it('should not contain ts-tab-icon', function() {
		var spirit = {},
			tabs = [{}],
			id = 'test',
			mobile = false;
		expect(gethtml(spirit, tabs, id, mobile)).not.toContain('ts-tab-icon');
	});

	it('should not contain ts-tab-label', function() {
		var spirit = {},
			tabs = [{ label: 'leo' }],
			id = 'test',
			mobile = false;
		expect(gethtml(spirit, tabs, id, mobile)).toContain('<span class="ts-tab-label">leo</span>');
	});
});
