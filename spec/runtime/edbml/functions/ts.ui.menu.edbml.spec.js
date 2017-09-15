describe('ts.ui.menu.edbml', function likethis() {
	function gethtml(menu) {
		var model = menu || { items: [{}, {}] };
		return ts.ui.menu.edbml(new ts.ui.MenuModel(model));
	}

	it('should contain ts-menu', function() {
		expect(gethtml()).toContain('data-ts="Menu"');
	});

	it('should contain padding-top:', function() {
		var menu = {
			items: [{}, {}],
			maxItemsShown: 1
		};
		expect(gethtml(menu)).toContain('padding-top:');
	});

	it('should not contain padding-top:', function() {
		expect(gethtml()).not.toContain('padding-top:');
	});

	it('should contain button', function() {
		var menu = {
			items: [
				{
					label: 'menu'
				}
			]
		};
		expect(gethtml(menu)).toContain('<button');
	});

	it('should contain disabled button', function() {
		var menu = {
			items: [
				{
					label: 'menu',
					disabled: true
				}
			]
		};
		expect(gethtml(menu)).toContain('<button disabled');
	});

	it('should not contain disabled button', function() {
		var menu = {
			items: [
				{
					label: 'menu'
				}
			]
		};
		expect(gethtml(menu)).not.toContain('<button disabled');
	});

	it('should contain icon', function() {
		var menu = {
			items: [
				{
					label: 'menu',
					icon: 'ts-icon-test'
				}
			]
		};
		expect(gethtml(menu)).toContain('ts-icon-test');
	});

	it('should contain label', function() {
		var menu = {
			items: [
				{
					label: 'test'
				}
			]
		};
		expect(gethtml(menu)).toContain('test');
	});

	it('should selected', function() {
		var menu = {
			items: [
				{
					label: 'menu'
				}
			],
			selectedIndex: 0
		};
		expect(gethtml(menu)).toContain('ts-icon-checked');
	});

	it('should contain ts-buttons', function() {
		var menu = {
			items: [
				{
					label: 'menu'
				},
				{
					label: 'menu'
				}
			],
			select: 'many',
			selectedIndexes: [1]
		};
		expect(gethtml(menu)).toContain('<menu data-ts="Buttons">');
	});

	it('should contain disabled ts-buttons', function() {
		var menu = {
			items: [
				{
					label: 'menu'
				},
				{
					label: 'menu'
				}
			],
			select: 'many',
			selectedIndexes: [1],
			donebuttonenabled: false
		};
		expect(gethtml(menu)).toContain('<button disabled');
	});

	it('should not contain disabled ts-buttons', function() {
		var menu = {
			items: [
				{
					label: 'menu'
				},
				{
					label: 'menu'
				}
			],
			select: 'many',
			selectedIndexes: [1],
			donebuttonenabled: true
		};
		expect(gethtml(menu)).not.toContain('<button disabled');
	});

	it('should contain ts-buttons label', function() {
		var menu = {
			items: [
				{
					label: 'menu'
				},
				{
					label: 'menu'
				}
			],
			select: 'many',
			selectedIndexes: [1],
			donebuttonlabel: 'test'
		};
		expect(gethtml(menu)).toContain('test');
	});
});
