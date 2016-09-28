describe('ts.ui.TopBar', function likethis() {


	// Expectations ..............................................................

	it('should be chainable', function() {
		expect(ts.ui.TopBar.
			title('Hest').
			tabs([]).
			buttons([]).
			green().
			blue().
			showBack(function() {}).
			showNext(function() {}).
			hideBack().
			hideNext().
			hide().
			show()
		).toBe(ts.ui.TopBar);
	});

});

describe('ts.ui.Notification', function likethis() {

	// Preparations ..............................................................

	/**
	 * Get body of latest notification. Account for 
	 * notifications lingering from previous tests.
	 * @returns {HTMLDivElement}
	 */
	function getlatest() {
		var list = document.querySelectorAll('.ts-dialog');
		var last = gui.Array.from(list).pop();
		return last.querySelector('.ts-dialog-body');
	}

	/**
	 * Wait for dialog to fade in.
	 * @param {function} action
	 */
	function waitfordialog(action) {
		setTimeout(function wait() {
			action();
		}, 500);
	}


	// Expectations ..............................................................

	it('should support markdown for formatting', function(done) {
		var text = 'Markdown for **bold text** and *italic text* and `source code`';
		var note = ts.ui.Notification.info(text);
		waitfordialog(function() {
			var body = getlatest();
			var html = body.innerHTML;
			['<strong>', '<em>', '<code>'].forEach(function(tag) {
				expect(html).toContain(tag);
			});
			note.accept();
			done();
		});
	});

	it('should support markdown for links', function(done) {
		var text = 'Markdown for (link text)[and_link_url]';
		var note = ts.ui.Notification.info(text);
		waitfordialog(function() {
			var body = getlatest();
			var html = body.innerHTML;
			expect(html).toContain('<a');
			expect(html).toContain('data-ts="Button"');
			expect(html).toContain('data-ts.data="and_link_url"');
			note.accept();
			done();
		});
	});

	it('should support multiple links', function(done) {
		var text = 'Choose link (one)[ONE] or (two)[TWO] or (three)[THREE].';
		var note = ts.ui.Notification.info(text);
		waitfordialog(function() {
			var body = getlatest();
			var linx = body.querySelectorAll('a');
			expect(linx.length).toBe(3);
			note.accept();
			done();
		});
	});

	it('should block the link text HaCkErZ', function(done) {
		var hack = '<span onclick="SuCkErZ()">linktext</span>';
		var text = 'Markdown for (' + hack + ')[mylink]';
		var note = ts.ui.Notification.info(text);
		waitfordialog(function() {
			var body = getlatest();
			var span = body.querySelector('span');
			expect(span).toBe(null); // it stays as markdown
			note.accept();
			done();
		});
	});

	it('should block the link href HaCkErZ', function(done) {
		var hack = '" onclick="SuCkErZ()';
		var text = 'Markdown for (link text)[' + hack + ']';
		var note = ts.ui.Notification.info(text);
		waitfordialog(function() {
			var body = getlatest();
			var link = body.querySelector('a');
			expect(link).toBe(null); // it stays as markdown
			note.accept();
			done();
		});
	});

});

describe('ts.ui.TableRowCollection', function likethis() {

	/*
	 * Three methods patched to prevent Angular models entering our state.
	 */
	it('should do push, unshift and splice as expected', function() {

			var col = new ts.ui.TableRowCollection();

			// push
			var ret = col.push([4, 5, 6]);
			expect(col.length).toBe(ret);
			expect(col.length).toBe(1);

			// unshift
			ret = col.unshift([1, 2, 3]);
			expect(col.length).toBe(ret);
			expect(col.length).toBe(2);

			// splice
			ret = col.splice(0, 0, [7, 8, 9]);
			expect(col.length).toBe(3);
			ret = col.splice(0, 1, [10, 11, 12]);
			expect(col.length).toBe(3);
			col.splice(0, 1);
			expect(col.length).toBe(2);

			// finally
			expect(col[0]).toEqual([1, 2, 3]);
			expect(col[1]).toEqual([4, 5, 6]);
	});

});
describe('ts.ui.aside.edbml', function likethis() {

	it('should contain a panel', function() {
		var html = ts.ui.aside.edbml();
		expect(html).toContain('data-ts="Panel"');
	});

});

describe('ts.ui.button.edbml', function likethis() {

	// @param {boolean} icononly
	function gethtml(icononly) {
		return ts.ui.button.edbml(
			new ts.ui.ButtonModel({
				icon: 'ts-icon-hest',
				label: (icononly ? null : 'Hest')
			})
		);
	}

	it('should contain a button', function() {
		expect(gethtml()).toContain('data-ts="Button"');
	});

	it('should contain a label', function() {
		expect(gethtml()).toContain('<span>Hest</span>');
	});

	it('should contain an icon', function() {
		expect(gethtml(true)).toContain('ts-icon-hest');
	});

	// label should override the icon - never show both!
	it('should not contain an icon', function() {
		expect(gethtml()).not.toContain('ts-icon-hest');
	});

});

describe('ts.ui.buttons.edbml', function likethis() {
	function gethtml() {
		return ts.ui.buttons.edbml(
			new ts.ui.ButtonCollection([{
				icon: 'ts-icon-hest',
				label: 'Hest1'
			},{
				icon: 'ts-icon-hest',
				label: 'Hest2'
			}])
		);
	}

	it('should contain a span', function() {
		expect(gethtml()).toContain('<span class="ts-join">');
	});	

	it('should contain button', function() {
		expect(gethtml()).toContain('data-ts="Button"');
	});
});

describe('ts.ui.buttonsmenu.edbml', function likethis() {
	function gethtml(hasbuttons) {
		var buttons = [{
					icon: 'ts-icon-hest',
					label: 'Hest1'
				},{
					icon: 'ts-icon-hest',
					label: 'Hest2'
				}];
		return ts.ui.buttonsmenu.edbml(
			new ts.ui.ButtonMenuModel({
				items: hasbuttons ? buttons : []
			})
		);
	}

	it('should contain ts-buttons', function() {
		expect(gethtml(true)).toContain('data-ts="Buttons"');
	});

	it('should not contain ts-buttons', function() {
		expect(gethtml(false)).not.toContain('data-ts="Buttons"');
	});

});

describe('ts.ui.companycard.edbml', function likethis() {

	var card = {
		id: '6bf17754-f9de-4e31-aa31-bd3ff765b9c2',
		data: {}
	};

	function gethtml(card, contentonly) {
		return ts.ui.companycard.edbml(new ts.ui.CompanyCardModel(card), contentonly);
	}

	it('should contain ts-companycard-main', function() {
		expect(gethtml(card, true)).toContain('ts-companycard-main');
	});

	it('should not contain ts-companycard', function() {
		expect(gethtml(card, true)).not.toContain('<div data-ts="CompanyCard"');
	});

	it('should contain ts-companycard', function() {
		expect(gethtml(card, false)).toContain('<div data-ts="CompanyCard"');
	});

	it('should not contain ts-mockup', function() {
		expect(gethtml(card, true)).not.toContain('ts-mockup');
	});

	it('should contain ts-mockup', function() {
		card.mock = true;
		expect(gethtml(card, true)).toContain('ts-mockup');
	});

	it('should not contain ts-companycard-location', function() {
		expect(gethtml(card, true)).not.toContain('ts-companycard-location');
	});

	it('should contain ts-companycard-location', function() {
		card.data.location = 'Copenhagen';
		expect(gethtml(card, true)).toContain('ts-companycard-location');
	});

	it('should not contain ts-companycard-industry', function() {
		expect(gethtml(card, true)).not.toContain('ts-companycard-industry');
	});

	it('should contain ts-companycard-industry', function() {
		card.data.industry = 'software'; 
		expect(gethtml(card, true)).toContain('ts-companycard-industry');
	});

	it('should not contain ts-companycard-users', function() {
		expect(gethtml(card, true)).not.toContain('ts-companycard-users');
	});

	it('should contain ts-companycard-users', function() {
		card.data.size = '100-200';
		expect(gethtml(card, true)).toContain('ts-companycard-users');
	});

	it('should not contain ts-card-connection-icon', function() {
		expect(gethtml(card, true)).not.toContain('ts-card-connection-icon');
	});

	it('should contain ts-card-connection-icon', function() {
		card.data.connection = 2;
		expect(gethtml(card, true)).toContain('ts-card-connection-icon');
	});

	it('should not contain ts-companycard-logo', function() {
		expect(gethtml(card, true)).not.toContain('ts-companycard-logo');
	});

	it('should contain ts-companycard-logo', function() {
		card.data.logo = 'flag.png';
		expect(gethtml(card, true)).toContain('ts-companycard-logo');
	});

});

describe('ts.ui.datepicker.edbml', function likethis() {

	it('should contain a calendar, obviously', function() {
		var html = ts.ui.datepicker.edbml();
		expect(html).toContain('data-ts="Calendar"');
	});

});

describe('ts.ui.form.edbml', function likethis() {

	it('should contain a form', function() {
		var html = ts.ui.form.edbml();
		expect(html).toContain('data-ts="Form"');
	});

	it('should contain an input field', function() {
		var html = ts.ui.form.edbml(new ts.ui.FormModel({
			items: [{
				item: 'input'
			}]
		}));
		expect(html).toContain('<input');
	});

	it('should contain a submit button', function() {
		var html = ts.ui.form.edbml(new ts.ui.FormModel({}).submitButton('Login')); // this API will change!
		expect(html).toContain('<button');
	});

});

describe('ts.ui.input.edbml', function likethis() {

	function gethtml() {
		return ts.ui.input.edbml(
			new ts.ui.InputModel({
				label: 'Hest',
				readonly: true,
				autofocus: true,
				required: true,
				disabled: true,
				placeholder: true
			})
		);
	}

	it('should contain an input', function() {
		expect(gethtml()).toContain('<input');
	});

	it('should contain a label', function() {
		expect(gethtml()).toContain('Hest');
	});

	it('should contain a group container', function() {
		expect(gethtml()).toContain('<fieldset');
	});

	it('should be readonly', function() {
		expect(gethtml()).toContain('readonly');
	});

	it('should have autofocus', function() {
		expect(gethtml()).toContain('autofocus');
	});

	it('should be required', function() {
		expect(gethtml()).toContain('required');
	});

	it('should be disabled', function() {
		expect(gethtml()).toContain('disabled');
	});

	it('should be placeholder', function() {
		expect(gethtml()).toContain('placeholder');
	});

});

describe('ts.ui.menu.edbml', function likethis() {
	function gethtml(menu) {
		var model = menu ? menu : {items: [{},{}]};
		return ts.ui.menu.edbml(
			new ts.ui.MenuModel(model)
		);
	}

	it('should contain ts-menu', function() {
		expect(gethtml()).toContain('data-ts="Menu"');
	});

	it('should contain padding-top:', function() {
		var menu = {
				items: [{},{}],
				maxItemsShown: 1
			};
		expect(gethtml(menu)).toContain('padding-top:');
	});

	it('should not contain padding-top:', function() {
		expect(gethtml()).not.toContain('padding-top:');
	});

	it('should contain button', function() {
		var menu = {
			items: [{
				label: 'menu'
			}]
		};
		expect(gethtml(menu)).toContain('<button');
	});

	it('should contain disabled button', function() {
		var menu = {
			items: [{
				label: 'menu',
				disabled: true
			}]
		};
		expect(gethtml(menu)).toContain('<button disabled');
	});

	it('should not contain disabled button', function() {
		var menu = {
			items: [{
				label: 'menu',
			}]
		};
		expect(gethtml(menu)).not.toContain('<button disabled');
	});

	it('should contain icon', function() {
		var menu = {
			items: [{
				label: 'menu',
				icon: 'ts-icon-test'
			}]
		};
		expect(gethtml(menu)).toContain('ts-icon-test');
	});

	it('should contain label', function() {
		var menu = {
			items: [{
				label: 'test'
			}]
		};
		expect(gethtml(menu)).toContain('test');
	});

	it('should selected', function() {
		var menu = {
			items: [{
				label: 'menu',
			}],
			selectedIndex: 0
		};
		expect(gethtml(menu)).toContain('ts-icon-checked');
	});

	it('should contain ts-buttons', function() {
		var menu = {
			items: [{
				label: 'menu',
			},{
				label: 'menu',
			}],
			select: 'many',
			selectedIndexes: [1]
		};
		expect(gethtml(menu)).toContain('<menu data-ts="Buttons">');
	});

	it('should contain disabled ts-buttons', function() {
		var menu = {
			items: [{
				label: 'menu',
			},{
				label: 'menu',
			}],
			select: 'many',
			selectedIndexes: [1],
			donebuttonenabled: false
		};
		expect(gethtml(menu)).toContain('<button disabled');
	});

	it('should not contain disabled ts-buttons', function() {
		var menu = {
			items: [{
				label: 'menu',
			},{
				label: 'menu',
			}],
			select: 'many',
			selectedIndexes: [1],
			donebuttonenabled: true
		};
		expect(gethtml(menu)).not.toContain('<button disabled');
	});

	it('should contain ts-buttons label', function() {
		var menu = {
			items: [{
				label: 'menu',
			},{
				label: 'menu',
			}],
			select: 'many',
			selectedIndexes: [1],
			donebuttonlabel: 'test'
		};
		expect(gethtml(menu)).toContain('test');
	});

});

describe('ts.ui.pager.edbml', function() {
	function gethtml() {
		return ts.ui.pager.edbml(
			new ts.ui.PagerModel()
		);
	}

	it('should contain ts-paper', function() {
		expect(gethtml()).toContain('<div data-ts="Pager"');
	});
});

describe('ts.ui.search.edbml', function() {
	function gethtml(inset) {
		return ts.ui.search.edbml(
			new ts.ui.SearchModel({
				inset: inset
			})
		);
	}

	it('should contain data-ts="Search"', function() {
		expect(gethtml(false)).toContain('<span data-ts="Search"');
	});

	it('should contain ts-inset', function() {
		expect(gethtml(true)).toContain('ts-inset');
	});

	it('should not contain ts-inset', function() {
		expect(gethtml(false)).not.toContain('ts-inset');
	});
});

describe('ts.ui.select.edbml', function likethis() {
	function gethtml() {
		return ts.ui.select.edbml(
			new ts.ui.SelectModel({
				options: [{value:1,text:'test'}]
			})
		);
	}

	it('should contain select', function() {
		expect(gethtml()).toContain('<select');
	});

	it('should contain option', function() {
		expect(gethtml()).toContain('value="1">test');
	});
});

describe('ts.ui.svgicons.edbml', function likethis() {
	function gethtml(icon, size) {
		return ts.ui.svgicons.edbml(icon, size);
	}

	it('should contain svg', function() {
		expect(gethtml('icon', 22)).toContain('<svg class="ts-svg-icon"');
	});

	it('should contain width and height', function() {
		expect(gethtml('icon', 22)).toContain('width="22" height="22"');
	});

	it('icon is fast-forward', function() {
		expect(gethtml('fast-forward', 22)).toContain('<path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/>');
	});

	it('icon is fast-rewind', function() {
		expect(gethtml('fast-rewind', 22)).toContain('<path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/>');
	});

	it('icon is skip-next', function() {
		expect(gethtml('skip-next', 22)).toContain('<path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>');
	});

	it('icon is skip-previous', function() {
		expect(gethtml('skip-previous', 22)).toContain('<path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>');
	});
});

describe('ts.ui.svgname.edbml', function likethis() {
	function gethtml(text, col1, col2, size, stylesheet_url, stylesheet_txt) {
		return ts.ui.svgname.edbml(text, col1, col2, size, stylesheet_url, stylesheet_txt);
	}

	it('should contain svg', function() {
		expect(gethtml()).toContain('<svg xmlns="http://www.w3.org/2000/svg"');
	});

	it('should contain text', function() {
		expect(gethtml()).toContain('<text x="50%"');
	});

	it('should contain col1, width and height', function() {
		expect(gethtml('test','red','green',22)).toContain('width="22px" height="22px" viewBox="0 0 22 22" style="background-color:red;"');
	});

	it('should contain defs', function() {
		expect(gethtml('test','red','green',22,'stylesheet_url')).toContain('<defs>');
	});

	it('should contain style sheet', function() {
		expect(gethtml('test','red','green',22,'stylesheet_url')).toContain('<style type="text/css">');
	});

	it('should contain style sheet contents', function() {
		var html = gethtml('test','red','green',22,'stylesheet_url');
		expect(html).toContain('text-anchor="middle"');
		expect(html).toContain('alignment-baseline="middle"');
		expect(html).toContain('font-size="8.46');
		expect(html).toContain('font-family="Open Sans"');
		expect(html).toContain('font-weight="300"');
		expect(html).toContain('fill="green"');
		expect(html).toContain('test');
		expect(html).toContain('</text>');
	});
});

describe('ts.ui.switch.edbml', function likethis() {
	function gethtml() {
		return ts.ui.switchonly.edbml();
	}

	it('should contain ts-switcher and icons', function() {
		expect(gethtml()).toContain('ts-switcher');
		expect(gethtml()).toContain('<i class="ts-icon-cancel"></i>');
		expect(gethtml()).toContain('<i class="ts-icon-checked"></i>');
	});
});

describe('ts.ui.tablecheck.edbml', function likethis() {
	function gethtml(table, row, fixed) {
		return ts.ui.tablecheck.edbml(table, row, fixed);
	}

	it('should contain ts-table-checkbox', function() {
		var table = {},
			row = {},
			fixed = true;
		expect(gethtml(table, row, fixed)).toContain('ts-table-checkbox');
		expect(gethtml(table, row, fixed)).toContain('<div class="ts-table-cell">');
		expect(gethtml(table, row, fixed)).toContain('<button class="ts-table-checkbox-button"');
	});

	it('should contain ts-icon-checkboxon', function() {
		var table = {},
			row = {selected: true},
			fixed = true;
		expect(gethtml(table, row, fixed)).toContain('ts-icon-checkboxon');
	});

	it('should contain ts-icon-checkbox', function() {
		var table = {},
			row = {selected: false},
			fixed = true;
		expect(gethtml(table, row, fixed)).toContain('ts-icon-checkbox');
		expect(gethtml(table, row, fixed)).not.toContain('ts-icon-checkboxon');
	});

	it('should contain fixed', function() {
		var table = {},
			row = {},
			fixed = true;
		expect(gethtml(table, row, fixed)).toContain('-fixed-');
		expect(gethtml(table, row, fixed)).not.toContain('-floating-');
	});

	it('should contain floating', function() {
		var table = {},
			row = {},
			fixed = false;
		expect(gethtml(table, row, fixed)).toContain('-floating-');
		expect(gethtml(table, row, fixed)).not.toContain('-fixed-');
	});

});

describe('ts.ui.tablecols.edbml', function likethis() {
	function gethtml(table, cols) {
		return ts.ui.tablecols.edbml(table, cols);
	}

	it('should contain ts-table-checkbox', function() {
		var table = {selectable: true},
			cols = [{},{}];
		expect(gethtml(table, cols)).toContain('ts-table-checkbox');
	});

	it('should contain col.type', function() {
		var table = {},
			cols = [{type:'ts-ui-col'}];
		expect(gethtml(table, cols)).toContain('ts-ui-col');
		expect(gethtml(table, cols)).not.toContain('ts-selected');
	});

	it('should contain ts-selected', function() {
		var table = {},
			cols = [{selected:true}];
		expect(gethtml(table, cols)).toContain('ts-selected');
	});

	it('should contain search component', function() {
		var table = {},
			col = new ts.ui.TableColModel({search:{hidden:false}}),
			cols = [col];
		expect(gethtml(table, cols)).toContain('<span data-ts="Search"');
	});

	it('should not contain search component', function() {
		var table = {},
			col = new ts.ui.TableColModel({search:{hidden:true}}),
			cols = [col];
		expect(gethtml(table, cols)).not.toContain('<span data-ts="Search"');
	});

	it('should contain button component', function() {
		var table = {},
			col = new ts.ui.TableColModel({button:{hidden:false}}),
			cols = [col];
		expect(gethtml(table, cols)).toContain('<button data-ts="Button"');
	});

	it('should not contain button component', function() {
		var table = {},
			col = new ts.ui.TableColModel({button:{hidden:true}}),
			cols = [col];
		expect(gethtml(table, cols)).not.toContain('<button ts-button');
	});

	it('should contain ts-icon-triangledown', function() {
		var table = {},
			cols = [{ascending:true}];
		expect(gethtml(table, cols)).toContain('ts-icon-triangledown');
		expect(gethtml(table, cols)).not.toContain('ts-icon-triangleup');
	});

	it('should contain ts-icon-triangleup', function() {
		var table = {},
			cols = [{ascending:false}];
		expect(gethtml(table, cols)).toContain('ts-icon-triangleup');
		expect(gethtml(table, cols)).not.toContain('ts-icon-triangledown');
	});

	it('should contain label', function() {
		var table = {},
			cols = [{label:'leo'}];
		expect(gethtml(table, cols)).toContain('<span>leo</span>');
	});
});

describe('ts.ui.tablegutter.edbml', function likethis() {
	function gethtml(table, rows) {
		return ts.ui.tablegutter.edbml(table, rows);
	}

	it('should contain ts-table-checkbox', function() {
		var table = {},
			rows = [{},{}];
		expect(gethtml(table, rows)).toContain('ts-table-checkbox');
	});
});

describe('ts.ui.tablemenu.edbml', function likethis() {
	function gethtml(table) {
		return ts.ui.tablemenu.edbml(table);
	}

	it('should contain ts-table-menu', function() {
		var table = new ts.ui.TableModel();
		expect(gethtml(table)).toContain('ts-table-menu');
		expect(gethtml(table)).toContain('<th class="ts-table-checkbox">');
		expect(gethtml(table)).toContain('<button data-action="selection-menu"');
	});

	it('should contain ts-open', function() {
		var table = new ts.ui.TableModel({menuopen:true});
		expect(gethtml(table)).toContain('ts-open ts-bg-yellow');
		expect(gethtml(table)).toContain('<th class="ts-table-choices">');
		expect(gethtml(table)).toContain('<th class="ts-table-choices-close">');
	});

	it('should not contain ts-open', function() {
		var table = new ts.ui.TableModel({menuopen:false});
		expect(gethtml(table)).not.toContain('ts-open ts-bg-yellow');
		expect(gethtml(table)).not.toContain('<th class="ts-table-choices">');
		expect(gethtml(table)).not.toContain('<th class="ts-table-choices-close">');
	});

	it('should contain ts-icon-checkboxon', function() {
		var table = new ts.ui.TableModel();
		spyOn(table, 'isVisibleRowSelected').and.returnValue(true);
		expect(gethtml(table)).toContain('class="ts-icon-checkboxon"');
		expect(gethtml(table)).not.toContain('class="ts-icon-checkbox"');
	});

	it('should contain ts-icon-checkbox', function() {
		var table = new ts.ui.TableModel();
		spyOn(table, 'isVisibleRowSelected').and.returnValue(false);
		expect(gethtml(table)).toContain('class="ts-icon-checkbox"');
		expect(gethtml(table)).not.toContain('class="ts-icon-checkboxon"');
	});
});

describe('ts.ui.tablerows.edbml.js', function likethis() {
	function gethtml(table, rows, cols) {
		return ts.ui.tablerows.edbml(table, rows, cols);
	}

	it('should contain tr (Object)', function() {
		var table = new ts.ui.TableModel(),
			rows = [{cells:[{}]}],
			cols = [new ts.ui.TableColModel()];
		expect(gethtml(table, rows, cols)).toContain('<tr data-index=');
		expect(gethtml(table, rows, cols)).toContain('<div class="ts-table-cell">');
	});

	it('should contain ts-table-checkbox', function() {
		var table = new ts.ui.TableModel({selectable: true}),
			rows = [{cells:[{},{},{}]}],
			cols = ['One', 'Two', 'Three'];
		expect(gethtml(table, rows, cols)).toContain('ts-table-checkbox');

	});

	it('should contain editable textarea', function() {
		var table = new ts.ui.TableModel({editable: true}),
			rows = [{cells:[{editable:true, valid:false},{},{}]}],
			cols = ['One', 'Two', 'Three'];
		expect(gethtml(table, rows, cols)).toContain('<div class="ts-table-line"');
		expect(gethtml(table, rows, cols)).toContain('<textarea rows="1" data-ts="TextArea" class="ts-table-input" type="submit">');
		expect(gethtml(table, rows, cols)).toContain('ts-editable');
		expect(gethtml(table, rows, cols)).toContain('ts-table-invalid');
	});

});

describe('ts.ui.toolbar.edbml', function likethis() {
	function gethtml(toolbar) {
		return ts.ui.toolbar.edbml(new ts.ui.ToolBarModel(toolbar));
	}

	it('should contain ts-toolbar', function() {
		var toolbar = {};
		expect(gethtml(toolbar)).toContain('data-ts="ToolBar"');
	});
});

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
			tabs = [{selected: true}],
			id = 'test',
			mobile = false;
		expect(gethtml(spirit, tabs, id, mobile)).toContain('ts-selected');
	});

	it('should not contain ts-selected', function() {
		var spirit = {},
			tabs = [{selected: false}],
			id = 'test',
			mobile = false;
		expect(gethtml(spirit, tabs, id, mobile)).not.toContain('ts-selected');
	});

	it('should contain ts-counter', function() {
		var spirit = {},
			tabs = [{counter: 2}],
			id = 'test',
			mobile = false;
		expect(gethtml(spirit, tabs, id, mobile)).toContain('ts-counter');
		expect(gethtml(spirit, tabs, id, mobile)).toContain('<em>2</em>');
	});

	it('should not contain ts-counter', function() {
		var spirit = {},
			tabs = [{counter: 0}],
			id = 'test',
			mobile = false;
		expect(gethtml(spirit, tabs, id, mobile)).not.toContain('ts-counter');
	});

	it('should contain ts-tab-close', function() {
		var spirit = {},
			tabs = [{selected: true, closeable: true}],
			id = 'test',
			mobile = false;
		expect(gethtml(spirit, tabs, id, mobile)).toContain('ts-tab-close');
	});

	it('should not contain ts-tab-close', function() {
		var spirit = {},
			tabs = [{selected: false, closeable: true}],
			id = 'test',
			mobile = false;
		expect(gethtml(spirit, tabs, id, mobile)).not.toContain('ts-tab-close');
	});

	it('should not contain ts-tab-close', function() {
		var spirit = {},
			tabs = [{selected: true, closeable: false}],
			id = 'test',
			mobile = false;
		expect(gethtml(spirit, tabs, id, mobile)).not.toContain('ts-tab-close');
	});

	it('should not contain ts-tab-close', function() {
		var spirit = {},
			tabs = [{selected: false, closeable: false}],
			id = 'test',
			mobile = false;
		expect(gethtml(spirit, tabs, id, mobile)).not.toContain('ts-tab-close');
	});

	it('should contain ts-tab-icon', function() {
		var spirit = {},
			tabs = [{icon: 'icon'}],
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
			tabs = [{label:'leo'}],
			id = 'test',
			mobile = false;
		expect(gethtml(spirit, tabs, id, mobile)).toContain('<span class="ts-tab-label">leo</span>');
	});
});

describe('ts.ui.usercard.edbml', function likethis() {
	function gethtml(user, contentonly, classconfig) {
		return ts.ui.usercard.edbml(user, contentonly, classconfig);
	}

	it('should contain ts-usercard-main', function() {
		var user = new ts.ui.UserCardModel({id:"leo"}),
			contentonly = true,
			classconfig = '';
		expect(gethtml(user, contentonly, classconfig)).toContain('ts-usercard-main');
	});

	it('should contain ts-usercard-name in front of ts-usercard-image', function() {
		var user = new ts.ui.UserCardModel({id:"leo"}),
			contentonly = true,
			classconfig = 'ts-compact ts-reverse';
		expect(gethtml(user, contentonly, classconfig)).toContain('<p class="ts-usercard-name"><span></span></p><p class="ts-usercard-image">');
	});

	it('should contain ts-usercard-image in front of ts-usercard-name', function() {
		var user = new ts.ui.UserCardModel({id:"leo"}),
			contentonly = true,
			classconfig = '';
		expect(gethtml(user, contentonly, classconfig)).toContain('<p class="ts-usercard-image"><img data-ts="UserImage"   width="44"  height="44" /></p><p class="ts-usercard-name"><span></span></p>');
	});

	it('should contain ts-usercard-details', function() {
		var user = new ts.ui.UserCardModel({id:"leo"}),
			contentonly = true,
			classconfig = 'ts-details';
		expect(gethtml(user, contentonly, classconfig)).toContain('ts-usercard-details');
	});

	it('should not contain ts-usercard-details', function() {
		var user = new ts.ui.UserCardModel({id:"leo"}),
			contentonly = true,
			classconfig = '';
		expect(gethtml(user, contentonly, classconfig)).not.toContain('ts-usercard-details');
	});

	it('should contain details', function() {
		var user = new ts.ui.UserCardModel({
					id: "leo",
					data: {
						title: 'leo',
						role: 'developer',
						company: 'tradeshift',
						email: 'lza@tradeshift.com'
					}
				}),
			contentonly = true,
			classconfig = 'ts-details';
		expect(gethtml(user, contentonly, classconfig)).toContain('<li class="ts-usercard-title">leo</li>');
		expect(gethtml(user, contentonly, classconfig)).toContain('<li class="ts-usercard-role">developer</li>');
		expect(gethtml(user, contentonly, classconfig)).toContain('<li class="ts-usercard-company">');
		expect(gethtml(user, contentonly, classconfig)).toContain('<li class="ts-usercard-email">');
	});
});

describe('ts.ui.AsideSpirit.edbml', function likethis() {

	function gethtml(model) {
		var spirit = ts.ui.AsideSpirit.summon(model);
		var dom = helper.createTestDom();
		dom.appendChild(spirit.element);
		return dom.innerHTML;
	}
	
	it('should contain header and panel', function(done) {

		var model = new ts.ui.AsideModel({
			title:'leo'
		});

		sometime(function later() {
			expect(gethtml(model)).toContain('ts-toolbar');
			expect(gethtml(model)).toContain('ts-panel');
			done();
		});
	});

	it('should contain item render', function(done) {
		var model = new ts.ui.AsideModel({
			items: [
				{
					item: 'text',
					text: 'daniel'
				}
			]
		});
		sometime(function later() {
			expect(gethtml(model)).toContain('daniel');
			done();
		});
	});


});

describe('ts.ui.CalendarSpirit.edbml', function likethis() {

	function gethtml(calendar) {
		var spirit = ts.ui.CalendarSpirit.summon(calendar);
		var dom = helper.createTestDom();
		dom.appendChild(spirit.element);
		return dom.innerHTML;
	}
	
	it('should contain ts-calendar-transports', function(done) {
		var calendar = new ts.ui.DatePickerModel();
		sometime(function later() {
			expect(gethtml(calendar)).toContain('<tr class="ts-calendar-transports">');
			expect(gethtml(calendar)).toContain('<tr class="ts-calendar-labels">');
			expect(gethtml(calendar)).toContain('<tbody class="ts-calendar-days">');
			done();
		});
	});

	it('should render buttons', function(done) {
		var calendar = new ts.ui.DatePickerModel();
		sometime(function later() {
			expect(gethtml(calendar)).toContain('ts-icon-triangleleft');
			expect(gethtml(calendar)).toContain('ts-icon-triangleright');
			done();
		});
	});

	it('should contian value', function(done) {
		var calendar = new ts.ui.DatePickerModel({
			value: '1973-03-26',
		});
		sometime(function later() {
			expect(gethtml(calendar)).toContain('1973');
			expect(gethtml(calendar)).toContain('3');
			expect(gethtml(calendar)).toContain('26');
			done();
		});
	});	

});

describe('ts.ui.DatepickerSpirit.edbml', function likethis() {

	var datePicker = ts.ui.DatePicker({
		title: "Your Birthday",
		value: '1973-03-26',
		onselect: function(newval, oldval) {
		}
	});
	
	it('should contain header', function() {
		expect(datePicker.title).toEqual('Your Birthday');
	});

	it('should change the isOpen to be true', function() {
		datePicker.open();
		expect(datePicker.isOpen).toBe(true);
	});

	it('should change the isOpen to be false', function() {
		datePicker.close();
		expect(datePicker.isOpen).toBe(false);
	});

	it('could open again', function() {
		datePicker.open();
		expect(datePicker.isOpen).toBe(true);
		datePicker.close();
	});

});

describe('ts.ui.DialogSpirit.edbml', function likethis() {

	function gethtml(dialog) {
		var spirit = ts.ui.DialogSpirit.summon(dialog);
		var dom = helper.createTestDom();
		dom.appendChild(spirit.element);
		return dom.innerHTML;
	}
	
	it('should contain icon', function(done) {
		var dialog = new ts.ui.DialogModel({
			icon: "moth-daniel-leo"
		});
		sometime(function later() {
			expect(gethtml(dialog)).toContain('<div class="ts-dialog-head">');
			expect(gethtml(dialog)).toContain('<i class="ts-dialog-icon moth-daniel-leo"></i>');
			done();
		});
	});

	it('should not contain icon', function(done) {
		var dialog = new ts.ui.DialogModel({});
		sometime(function later() {
			expect(gethtml(dialog)).not.toContain('<div class="ts-dialog-head">');
			done();
		});
	});

	it('should render item', function(done) {
		var dialog = new ts.ui.DialogModel({
			items: [
				{
					item: 'text',
					text: 'daniel'
				}
			]
		});
		sometime(function later() {
			expect(gethtml(dialog)).toContain('<div class="ts-dialog-body">');
			expect(gethtml(dialog)).toContain('daniel');
			done();
		});
	});

	it('should not render item', function(done) {
		var dialog = new ts.ui.DialogModel({});
		sometime(function later() {
			expect(gethtml(dialog)).not.toContain('<div class="ts-dialog-body">');
			done();
		});
	});

	it('should render item', function(done) {
		var dialog = new ts.ui.DialogModel({
			buttons: [
				{
					label: 'moth'
				}
			]
		});
		sometime(function later() {
			expect(gethtml(dialog)).toContain('<div class="ts-dialog-buttons">');
			expect(gethtml(dialog)).toContain('ts-buttons');
			expect(gethtml(dialog)).toContain('moth');
			done();
		});
	});

	it('should not render buttons', function(done) {
		var dialog = new ts.ui.DialogModel({});
		sometime(function later() {
			expect(gethtml(dialog)).not.toContain('<div class="ts-dialog-buttons">');
			done();
		});
	});

});

describe('ts.ui.NoteSpirit.edbml', function likethis() {

	function gethtml(model) {
		var spirit = ts.ui.NoteSpirit.summon(model);
		var dom = helper.createTestDom();
		dom.appendChild(spirit.element);
		return dom.innerHTML;
	}
	

	it('should contian icon', function(done) {
		var model = new ts.ui.NoteModel({
			icon: "ts-icon-leo"
		});
		sometime(function later() {
			expect(gethtml(model)).toContain('ts-icon-leo');
			done();
		});
	});

	it('should contian text', function(done) {
		var model = new ts.ui.NoteModel({
			text: "daniel"
		});
		sometime(function later() {
			expect(gethtml(model)).toContain('daniel');
			done();
		});
	});

	it('should contian close button', function(done) {
		var model = new ts.ui.NoteModel({
			onclose: function(){}
		});
		sometime(function later() {
			expect(gethtml(model)).toContain('<button class="ts-note-close"');
			expect(gethtml(model)).toContain('<i class="ts-icon-close"></i>');
			done();
		});
	});


});

describe('ts.ui.PagerSpirit.edbml', function likethis() {

	var html = '<div data-ts="Pager" data-ts.pages="8" data-ts.page="0"></div>';
	
	it('should contain menu', function(done) {
		sometime(function later() {
			expect(helper.gethtml(html)).toContain('<menu>');
			done();
		});
	});

	it('should contain disabled', function(done) {
		sometime(function later() {
			expect(helper.gethtml(html)).toContain('disabled="disabled" data-jump');
			done();
		});
	});

	it('should contain ts-pager-jump ts-pager-first', function(done) {
		sometime(function later() {
			expect(helper.gethtml(html)).toContain('ts-pager-jump ts-pager-first');
			done();
		});
	});

	it('should contain skip-previous', function(done) {
		sometime(function later() {
			expect(helper.gethtml(html)).toContain('skip-previous');
			done();
		});
	});

	it('should contain ts-pager-jump ts-pager-prev', function(done) {
		sometime(function later() {
			expect(helper.gethtml(html)).toContain('ts-pager-jump ts-pager-prev');
			done();
		});
	});

	it('should contain fast-rewind', function(done) {
		sometime(function later() {
			expect(helper.gethtml(html)).toContain('fast-rewind');
			done();
		});
	});

	it('should contain ts-pager-step', function(done) {
		sometime(function later() {
			expect(helper.gethtml(html)).toContain('ts-pager-step');
			done();
		});
	});

	it('should contain 1 to 5', function(done) {
		sometime(function later() {
			expect(helper.gethtml(html)).toContain('1');
			expect(helper.gethtml(html)).toContain('2');
			expect(helper.gethtml(html)).toContain('3');
			expect(helper.gethtml(html)).toContain('4');
			expect(helper.gethtml(html)).toContain('5');
			done();
		});
	});

	it('should contain ts-selected', function(done) {
		sometime(function later() {
			expect(helper.gethtml(html)).toContain('ts-selected');
			done();
		});
	});

	it('should contain ts-more', function(done) {
		sometime(function later() {
			expect(helper.gethtml(html)).toContain('ts-more');
			done();
		});
	});

	it('should contain ts-pager-jump ts-pager-next', function(done) {
		sometime(function later() {
			expect(helper.gethtml(html)).toContain('ts-pager-jump ts-pager-next');
			done();
		});
	});

	it('should contain fast-forward', function(done) {
		sometime(function later() {
			expect(helper.gethtml(html)).toContain('fast-forward');
			done();
		});
	});

	it('should contain ts-pager-jump ts-pager-last', function(done) {
		sometime(function later() {
			expect(helper.gethtml(html)).toContain('ts-pager-jump ts-pager-last');
			done();
		});
	});

	it('should contain skip-next', function(done) {
		sometime(function later() {
			expect(helper.gethtml(html)).toContain('skip-next');
			done();
		});
	});

});

describe('ts.ui.PagerSpirit.edbml', function likethis() {

	it('should contain input', function(done) {
		var html = '<div data-ts="Search" class="ts-inset"></div>';
		sometime(function later() {
			expect(helper.gethtml(html)).toContain('<input');
			done();
		});
	});

	it('should contain button', function(done) {
		var html = '<div data-ts="Search" class="ts-inset"></div>';
		sometime(function later() {
			expect(helper.gethtml(html)).toContain('<button');
			done();
		});
	});

	it('should contain close icon', function(done) {
		var html = '<div data-ts="Search" class="ts-inset"></div>';
		sometime(function later() {
			expect(helper.gethtml(html)).toContain('<i class="ts-icon-close"></i>');
			done();
		});
	});

	it('should contain tip', function(done) {
		var html = '<div data-ts="Search" tip="leo"></div>';
		sometime(function later() {
			expect(helper.gethtml(html)).toContain('leo');
			done();
		});
	});

});

describe('ts.ui.TableGutterSpirit.edbml', function likethis() {

	it('should contain input', function(done) {
		var html = '<div data-ts="Table"></div>';
		sometime(function later() {
			expect(helper.gethtml(html)).toContain('<table');
			expect(helper.gethtml(html)).toContain('<tbody>');
			done();
		});
	});
});

describe('ts.ui.TableSpirit.edbml', function likethis() {

	function getspirit(html, id) {
		var dom = helper.createTestDom();
		dom.innerHTML = html;
		var spirit = ts.ui.get(dom.querySelector('#' + id));
		return spirit;
	}

	it('should contain table', function(done) {
		var html = '<div data-ts="Table"></div>';
		sometime(function later() {
			expect(helper.gethtml(html)).toContain('ts-spirit');
			expect(helper.gethtml(html)).toContain('<table><thead>');
			expect(helper.gethtml(html)).toContain('ts-table-body');
			expect(helper.gethtml(html)).toContain('ts-table-rows');
			done();
		});
	});

	it('should contain gutter', function(done) {
		var html = '<div data-ts="Table" id="mytable"></div>';
		var spirit = getspirit(html, 'mytable');
		spirit.selectable().rows([{ cells: ['A', 'D', 'G'], selected: true}]);
		sometime(function later() {
			expect(spirit.element.innerHTML).toContain('ts-table-gutter');
			done();
		});
	});

	it('should contain foot', function(done) {
		// Dont konw why, we can't use the same id, or it will show some null error
		var html = '<div data-ts="Table" id="mytable1"></div>';
		var spirit = getspirit(html, 'mytable1');
		spirit.configurable();
		sometime(function later() {
			expect(spirit.element.innerHTML).toContain('ts-table-foot');
			done();
		});
	});
});

describe('ts.ui.ToolBarSpirit.edbml', function likethis() {
	function getspirit(html, id) {
		var dom = helper.createTestDom();
		dom.innerHTML = html;
		var spirit = ts.ui.get(dom.querySelector('#' + id));
		return spirit;
	}

	it('should render title', function(done) {
		var html = '<footer data-ts="ToolBar" id="mytoolbar1"></footer>';
		var spirit = getspirit(html, 'mytoolbar1');
		spirit.title('leo');
		sometime(function later(){
			expect(spirit.element.innerHTML).toContain('ts-toolbar-title');
			expect(spirit.element.innerHTML).toContain('leo');
			done();
		});
	});

	it('should render search', function(done) {
		var html = '<footer data-ts="ToolBar" id="mytoolbar2"></footer>';
		var spirit = getspirit(html, 'mytoolbar2');
		spirit.search({});
		sometime(function later(){
			expect(spirit.element.innerHTML).toContain('ts-toolbar-search');
			done();
		});
	});

	it('should render button', function(done) {
		var html = '<footer data-ts="ToolBar" id="mytoolbar3"></footer>';
		var spirit = getspirit(html, 'mytoolbar3');
		spirit.buttons([{
			label: 'Daniel',
			type: 'ts-primary'
		}]);
		sometime(function later(){
			expect(spirit.element.innerHTML).toContain('ts-primary');
			expect(spirit.element.innerHTML).toContain('Daniel');
			done();
		});
	});

	it('should render ts-toolbar-menu', function(done) {
		var html = '<footer data-ts="ToolBar" id="mytoolbar4"></footer>';
		var spirit = getspirit(html, 'mytoolbar4');
		spirit.title('moth');
		sometime(function later(){
			expect(spirit.element.innerHTML).toContain('ts-toolbar-menu');
			done();
		});
	});


});

describe('ts.ui.TabBarSpirit', function likethis() {


	// Preparations ..............................................................
	
	function setup(action) {
		var spirit, dom = helper.createTestDom();
		dom.innerHTML = '<div data-ts="TabBar"></div>';
		sometime(function later() {
			spirit = ts.ui.get(dom.querySelector('div[data-ts=TabBar]'));
			action(spirit);
		});
	}

	function gettabsitem(spirit) {
		return spirit.element.querySelector('.ts-toolbar-menu.ts-left');	
	}

	// Expectations ..............................................................

	it('should (eventually) channel via ts-attribute', function(done) {
		setup(function(spirit) {
			expect(spirit.constructor).toBe(ts.ui.TabBarSpirit);
			done();
		});
	});

	// SKETCHY TESTS ZONE ........................................................
	
	/*
	
	// NOTE: this test may be subject to random failure
	
	it('should show some tabs', function(done) {
		var item;
		setup(function(spirit) {
			spirit.tabs([
				{
					label: 'Leo'
				},
				{
					label: 'Daniel'
				}
			]);
			sometime(function later() {
				item = gettabsitem(spirit);
				console.log('some tabs');
				expect(item.innerHTML).toContain('Leo');
				expect(item.innerHTML).toContain('Daniel');
				done();
			});
		});
	});
	
	it('should have more tabs', function(done) {
		var item;
		setup(function(spirit) {
			var tabs = [];
			for (var i = 0; i < 10; i++) {
				tabs.push({label: 'Moth' + i});
			}
			spirit.tabs(tabs);
			
			sometime(function later() {
				item = gettabsitem(spirit);
				expect(item.innerHTML).toContain('Moth');
				expect(item.innerHTML).toContain('More');
				done();
			});
		});
	});

	*/

});

describe('ts.ui.ToolBarSpirit', function likethis() {

	var isExplorer = (
		navigator.userAgent.indexOf('MSIE') !== -1 ||
		navigator.appVersion.indexOf('Trident/') > 0
	);


	// Preparations ..............................................................
	
	function setup(action) {
		var spirit, dom = helper.createTestDom();
		dom.innerHTML = '<header data-ts="ToolBar"></header>';
		sometime(function later() {
			spirit = ts.ui.get(dom.querySelector('header[data-ts=ToolBar]'));
			action(spirit);
		});
	}

	function getsearchlabel(spirit) {
		return spirit.element.querySelector('.ts-toolbar-search label');
	}

	function getsearchinput(spirit) {
		return spirit.element.querySelector('.ts-toolbar-search input');
	}

	function getbuttonsitem(spirit) {
		return spirit.element.querySelector('.ts-toolbar-menu.ts-right');
	}

	function getpageritem(spirit) {
		return spirit.element.querySelector('.ts-toolbar-menu.ts-center');	
	}

	function keydownsearch(spirit) {
		var i = getsearchinput(spirit);
		var e = document.createEvent('Event');
		e.keyCode = 13;
		e.initEvent('keydown', true, true);
		i.focus();
		i.dispatchEvent(e);
	}


	// Expectations ..............................................................

	it('should (eventually) channel via ts-attribute', function(done) {
		setup(function(spirit) {
			expect(spirit.constructor).toBe(ts.ui.ToolBarSpirit);
			done();
		});
	});

	it('should show a title via DOM attribute', function(done) {
		setup(function(spirit) {
			spirit.element.setAttribute('data-ts.title', 'Hest');
			sometime(function later() {
				expect(spirit.element.innerHTML).toContain('Hest');
				done();
			});
		});
	});

	it('should show a title via API call', function(done) {
		setup(function(spirit) {
			spirit.title('Hest');
			sometime(function later() {
				expect(spirit.element.innerHTML).toContain('Hest');
				done();
			});
		});
	});

	it('should show a search field', function(done) {
		var input;
		setup(function(spirit) {
			spirit.search({
				value: 'Hest'
			});
			sometime(function later() {
				input = getsearchinput(spirit);
				expect(input.value).toBe('Hest');
				spirit.search().value = 'Fest';
				sometime(function later() {
					input = getsearchinput(spirit);
					expect(input.value).toBe('Fest');
					done();
				});
			});
		});
	});

	it('should show some buttons', function(done) {
		var item;
		setup(function(spirit) {
			spirit.buttons([
				{ 
					type: 'ts-primary',
					label: 'Hest'
				},
				{
					type: 'ts-secondary',
					label: 'Fest'
				}
			]);
			sometime(function later() {
				item = getbuttonsitem(spirit);
				expect(item.innerHTML).toContain('Hest');
				expect(item.innerHTML).toContain('Fest');
				done();
			});
		});
	});

	it('should support button groups', function(done) {
		var item;
		setup(function(spirit) {
			spirit.buttons([
				[
					{ label: 'Hest' },
					{ label: 'Fest' }
				]
			]);
			sometime(function later() {
				item = getbuttonsitem(spirit);
				expect(item.innerHTML).toContain('ts-join');
				done();
			});
		});
	});

	// it('should support pager', function(done) {
	// 	var item;
	// 	setup(function(spirit) {
	// 		spirit.pager({
	// 			pages: 5,
	// 			page: 0
	// 		});
	// 		sometime(function later() {
	// 			item = getpageritem(spirit);
	// 			expect(item.innerHTML).toContain('ts-pager');
	// 			done();
	// 		});
	// 	});
	// });
	
	
	// SKETCHY TESTS ZONE ........................................................
	
	/*

	// NOTE: this test may be subject to random failure
	it('should expand/collapse search on focus/blur', function(done) {
		setup(function(spirit) {
			spirit.search({});
			sometime(function later() {
				spirit.search().focus();
				sometime(function later() {
					console.log(document.activeElement); // otherwise fail :/ but why?
					expect(spirit.dom.html()).toContain('data-ts="Search"ing');
					done();
				});
			});
		});
	});
	
	// NOTE: this test may be subject to random failure
	it('should call onsubmit when ENTER is pressed', function(done) {
		setup(function(spirit) {
			spirit.search({
				value: 'Hest',
				onsearch: function(value) {
					if(value === 'Hest') {
						done();
					}
				}
			});
			if(isExplorer) {
				done(); // TODO: Figure out what's wrong with fake keypress in IE
			} else {
				setTimeout(function() {
					keydownsearch(spirit);
				});
			}
		});
	});

	// NOTE: this test may be subject to random failure
	it('should call onidle when user is idle', function(done) {
		setup(function(spirit) {
			spirit.search({
				value: 'Hest',
				onidle: function(value) {
					if(value === 'Hest') {
						done();
					}
				}
			});
			if(isExplorer) {
				done(); // TODO: Figure out what's wrong with fake keypress in IE
			} else {
				setTimeout(function() {
					keydownsearch(spirit);
				});
			}
		});
	});
	*/

});

describe('ts.ui.AsideSpirit', function likethis() {

	var MARKUP = '<aside data-ts="Aside"><div data-ts="Panel"></div></aside>';
	var TRANSITION_DONE = (ts.ui.TRANSITION_FAST + 100);

	it('should (eventually) channel via ts-attribute', function(done) {
		var spirit, dom = helper.createTestDom();
		dom.innerHTML = MARKUP;
		sometime(function later() {
			spirit = ts.ui.get(dom.querySelector('aside'));
			expect(spirit.constructor).toBe(ts.ui.AsideSpirit);
			done();
		});
	});

	it('should fail spectacularly when an open aside is nuked', function(done) {
		var spirit, err = null, dom = helper.createTestDom();
		dom.innerHTML = MARKUP;
		sometime(function later() {
			spirit = ts.ui.get(dom.querySelector('aside'));
			window.onerror = function detachRunsAsync(e) {
				console.log(e.message);
				window.onerror = null;
				try {
					dom.removeChild(spirit.element);
				} catch(justincase) {}
				done();
			};
			spirit.open();
			sometime(function muchlater() {
				dom.removeChild(spirit.element);
			});
		});
	});

	describe('a broadcast close', function() {
		beforeEach(function(done) {
			var that = this;
			var dom = helper.createTestDom();
			dom.innerHTML = '<aside data-ts="Aside"><div data-ts="Panel"></div></aside>';
			sometime(function later() {
				that.spirit = ts.ui.get(dom.querySelector('[data-ts=Aside]'));
				expect(that.spirit.constructor).toBe(ts.ui.AsideSpirit);
				done();
			});
		});
		it('(should first evaluate open and onopened)', function(done) {
			var spirit = this.spirit, onopen = false, onopened = false;
			spirit.onopen = function() {
				onopen = true;
			};
			spirit.onopened = function() {
				onopened = true;
				expect(onopen && onopened).toBe(true);
				done();
			};
			spirit.open();
		}); 
		it('closes the aside', function(done) {
			var spirit = this.spirit;
			setTimeout(function() {
				gui.Broadcast.dispatchGlobal(ts.ui.BROADCAST_GLOBAL_ASIDES_DO_CLOSE);
				setTimeout(function() {
					expect(spirit.isOpen).toBe(false);
					done();
				}, TRANSITION_DONE);
			}, TRANSITION_DONE);
		});
	});

	describe('a broadcast close to an aside in a drawer', function() {
		beforeEach(function(done) {
			var that = this;
			var dom = helper.createTestDom();
			dom.innerHTML =
				'<aside data-ts="SideBar">' +
					'<div data-ts="Panel"></div>' +
					'<aside data-ts="Aside"><div data-ts="Panel"></div></aside>' +
				'</aside>';
			sometime(function later() {
				that.spirit = ts.ui.get(dom.querySelector('[data-ts=Aside]'));
				expect(that.spirit.constructor).toBe(ts.ui.AsideSpirit);
				that.spirit.onopened = done;
				that.spirit.open();
			});
		});

		afterEach(function(done) {
			this.spirit.onclosed = done;
			this.spirit.close();
		});

		it('ignores broadcasts', function(done) {
			var spirit = this.spirit;
			setTimeout(function() {
				gui.Broadcast.dispatchGlobal(ts.ui.BROADCAST_GLOBAL_ASIDES_DO_CLOSE);
				setTimeout(function() {
					expect(spirit.isOpen).toBe(true);
					done();
				}, TRANSITION_DONE);
			}, TRANSITION_DONE);
		});
	});
});

describe('ts.ui.CalendarSpirit', function() {
	describe('_generateDays', function() {
		describe('a mid-year month starting with a Monday', function() {
			beforeEach(function() {
				this.monthData = ts.ui.__generateDays('2014', '8', '2015', '2', '0');
			});

			it('has 5 weeks', function() {
				expect(this.monthData.length).toBe(5);
			});

			it('starts with a Monday', function() {
				var firstDay = this.monthData[0][0];
				expect(firstDay.day).toBe(1);
				expect(firstDay.month).toBe(8);
				expect(firstDay.year).toBe(2014);
			});

			it('ends on the 5th of the next month', function() {
				var lastWeek = this.monthData[this.monthData.length - 1];
				var lastDay = lastWeek[lastWeek.length - 1];
				expect(lastDay.day).toBe(5);
				expect(lastDay.month).toBe(9);
				expect(lastDay.year).toBe(2014);
			});
		});

		describe('a mid-year month starting with a Tuesday', function() {
			beforeEach(function() {
				this.monthData = ts.ui.__generateDays('2014', '6', '2015', '2', '0');
			});

			it('has 5 weeks', function() {
				expect(this.monthData.length).toBe(5);
			});

			it('starts with a Monday of June', function() {
				var firstDay = this.monthData[0][0];
				expect(firstDay.day).toBe(30);
				expect(firstDay.month).toBe(5);
				expect(firstDay.year).toBe(2014);
			});

			it('ends on the 3rd of August', function() {
				var lastWeek = this.monthData[this.monthData.length - 1];
				var lastDay = lastWeek[lastWeek.length - 1];
				expect(lastDay.day).toBe(3);
				expect(lastDay.month).toBe(7);
				expect(lastDay.year).toBe(2014);
			});
		});

		describe('a mid-year month starting with a Sunday', function() {
			beforeEach(function() {
				this.monthData = ts.ui.__generateDays('2014', '5', '2015', '2', '0');
			});

			it('has 5 weeks', function() {
				expect(this.monthData.length).toBe(6);
			});

			it('starts with a Monday of May', function() {
				var firstDay = this.monthData[0][0];
				expect(firstDay.day).toBe(26);
				expect(firstDay.month).toBe(4);
				expect(firstDay.year).toBe(2014);
			});

			it('ends on the 6th of July', function() {
				var lastWeek = this.monthData[this.monthData.length - 1];
				var lastDay = lastWeek[lastWeek.length - 1];
				expect(lastDay.day).toBe(6);
				expect(lastDay.month).toBe(6);
				expect(lastDay.year).toBe(2014);
			});
		});

		describe('a month containing a selected day', function() {
			beforeEach(function() {
				this.monthData = ts.ui.__generateDays('2014', '8', '2014', '8', '1');
			});

			it('has the first day selected', function() {
				var firstDay = this.monthData[0][0];
				console.log(firstDay);
				expect(firstDay.day).toBe(1);
				expect(firstDay.month).toBe(8);
				expect(firstDay.year).toBe(2014);
				expect(firstDay.selected).toBe(true);
			});
		});
	});
});

describe('ts.ui.DialogSpirit', function likethis() {

	it('should display confirm information', function() {
		var spirit = ts.ui.Dialog.confirm('leo', {});
		sometime(function later(){
			expect(spirit.element.innerHTML).toContain('leo');
		});
	});

	it('should display ok button', function() {
		var spirit = ts.ui.Dialog.confirm('leo', {});
		sometime(function later(){
			expect(spirit.element.innerHTML).toContain('ok');
		});
	});

	it('should display cancel button', function() {
		var spirit = ts.ui.Dialog.confirm('leo', {});
		sometime(function later(){
			expect(spirit.element.innerHTML).toContain('cancel');
		});
	});

	it('should display daniel button', function() {
		var spirit = ts.ui.Dialog.confirm('leo', 'daniel', {});
		sometime(function later(){
			expect(spirit.element.innerHTML).toContain('daniel');
			expect(spirit.element.innerHTML).not.toContain('ok');
		});
	});

	it('should display primary button', function() {
		var spirit = ts.ui.Dialog.confirm('leo', {primary: 'accept', focused: 'accept'});
		sometime(function later(){
			expect(spirit.element.innerHTML).toContain('ts-primary');
			expect(spirit.element.innerHTML).toContain('ts-focused');
		});
	});

	it('should contain ts-dialog-warning', function() {
		var spirit = ts.ui.Dialog.warning('leo', {});
		sometime(function later(){
			expect(spirit.element.innerHTML).toContain('ts-dialog-warning');
		});
	});

	it('should contain ts-dialog-danger', function() {
		var spirit = ts.ui.Dialog.danger('leo', {});
		sometime(function later(){
			expect(spirit.element.innerHTML).toContain('ts-dialog-danger');
		});
	});
});

describe('ts.ui.MainSpirit', function likethis() {
	function setup(action, html, done) {
		var spirit, dom = helper.createTestDom();
		dom.innerHTML = html;
		sometime(function later(){
			spirit = ts.ui.get(dom.querySelector('main'));
			action(spirit, dom);
			done();
		});
	}

	it('should show a spinner via DOM attribute', function(done) {
		var html = '<main data-ts="Main"></main>';
		setup(function(spirit, dom) {
			spirit.element.setAttribute('ts.busy', 'Moth');
			sometime(function later() {
				expect(dom.querySelector('.ts-spinner-text').innerHTML).toContain('Moth');
				expect(dom.querySelector('body')).toContain('ts-spinner-text');
				done();
			});
		}, html, done);
	});

	it('should show a blocking spinner via DOM attribute', function(done) {
		var html = '<main data-ts="Main"></main>';
		setup(function(spirit, dom) {
			spirit.element.setAttribute('data-ts.blocking', 'Moth');
			sometime(function later() {
				expect(dom.querySelector('.ts-spinner-text').innerHTML).toContain('Moth');
				expect(dom.querySelector('body')).toContain('ts-spinner-cover');
				done();
			});
		}, html, done);
	});

	// NOTE: this test may be subject to random failure
	// it('should show a tabbar', function(done) {
	// 	var html = '<main ts-main>'+
	// 					'<div ts-main-content>'+
	// 						'<div ts-panel="" ts.label="leo">'+ 
	// 							'<p>main content.</p>'+
	// 						'</div>'+
	// 						'<div ts-panel="" ts.label="daniel">'+
	// 							'<p>main content.</p>'+
	// 						'</div>'+
	// 					'</div>'+
	// 				'</main>';
	// 	setup(function(spirit, dom) {
	// 		sometime(function later() {
	// 			expect(dom.querySelector('.ts-tabbar').innerHTML).toContain('leo');
	// 			expect(dom.querySelector('.ts-tabbar').innerHTML).toContain('daniel');
	// 			expect(dom.querySelector('.ts-tabbar').innerHTML).toContain('ts-toolbar-menu');
	// 			done();
	// 		});
	// 	}, html, done);
	// });


});

describe('ts.ui.MenuSpirit', function likethis() {
	function setup(action, html, done) {
		var spirit, dom = helper.createTestDom();
		dom.innerHTML = html;
		sometime(function later(){
			spirit = ts.ui.get(dom.querySelector('menu'));
			action(spirit);
			done();
		});
	}

	it('should (eventually) channel via ts-attribute', function(done) {
		var html = '<menu data-ts=Menu"></menu>';
		setup(function(spirit) {
			sometime(function later() {
				expect(spirit.constructor).toBe(ts.ui.MenuSpirit);
				done();
			});
		}, html, done);
	});

	it('should show a blocking spinner via DOM attribute', function(done) {
		var html = '<menu data-ts="Menu"><li><button><span>Moth</span><sub>Leo</sub><i class="ts-icon-rating"></i></button></li></menu>';
		setup(function(spirit) {
			sometime(function later() {
				expect(spirit.element.innerHTML).toContain('Moth');
				expect(spirit.element.innerHTML).toContain('Leo');
				expect(spirit.element.innerHTML).toContain('ts-icon-rating');
				done();
			});
		}, html, done);
	});
});

describe('ts.ui.NoteSpirit', function likethis() {
	function setup(action, html, done) {
		var spirit, dom = helper.createTestDom();
		dom.innerHTML = html;
		sometime(function later(){
			spirit = ts.ui.get(dom.querySelector('div[data-ts=Note]'));
			action(spirit);
			done();
		});
	}

	it('should (eventually) channel via ts-attribute', function(done) {
		var html = '<div ts-data-ts="Note"></div>';
		setup(function(spirit) {
			sometime(function later() {
				expect(spirit.constructor).toBe(ts.ui.NoteSpirit);
				done();
			});
		}, html, done);
	});

	it('should contain icon', function(done) {
		var html = '<div data-ts="Note"><i class="ts-icon-heart"></i></div>';
		setup(function(spirit) {
			sometime(function later() {
				expect(spirit.element.innerHTML).toContain('ts-icon-heart');
				done();
			});
		}, html, done);
	});

	it('should contain text', function(done) {
		var html = '<div data-ts="Note"><p>leo</p></div>';
		setup(function(spirit) {
			sometime(function later() {
				expect(spirit.element.innerHTML).toContain('leo');
				done();
			});
		}, html, done);
	});

});

describe('ts.ui.PagerSpirit', function likethis() {
	function setup(action, html, done) {
		var spirit, dom = helper.createTestDom();
		dom.innerHTML = html;
		sometime(function later(){
			spirit = ts.ui.get(dom.querySelector('div[data-ts=Pager]'));
			action(spirit, dom);
			done();
		});
	}

	it('should (eventually) channel via ts-attribute', function(done) {
		var html = '<div data-ts="Pager"></div>';
		setup(function(spirit, dom) {
			sometime(function later() {
				expect(spirit.constructor).toBe(ts.ui.PagerSpirit);
				done();
			});
		}, html, done);
	});

	it('should select the first page', function(done) {
		var html = '<div data-ts="Pager" data-ts.pages="8" data-ts.page="0"></div>';
		setup(function(spirit, dom) {
			sometime(function later() {
				expect(dom.querySelector('.ts-selected').innerHTML).toContain('1');
				expect(dom.querySelector('.ts-pager-first').getAttribute('disabled')).toBe('disabled');
				expect(dom.querySelector('.ts-pager-prev').getAttribute('disabled')).toBe('disabled');
				expect(dom.querySelector('.ts-pager-next').getAttribute('disabled')).not.toBe('disabled');
				expect(dom.querySelector('.ts-pager-last').getAttribute('disabled')).not.toBe('disabled');
				done();
			});
		}, html, done);
	});

	it('should select the second page', function(done) {
		var html = '<div data-ts="Pager" data-ts.pages="8" data-ts.page="1"></div>';
		setup(function(spirit, dom) {
			sometime(function later() {
				expect(dom.querySelector('.ts-selected').innerHTML).toContain('2');
				expect(dom.querySelector('.ts-pager-first').getAttribute('disabled')).not.toBe('disabled');
				expect(dom.querySelector('.ts-pager-prev').getAttribute('disabled')).not.toBe('disabled');
				expect(dom.querySelector('.ts-pager-next').getAttribute('disabled')).not.toBe('disabled');
				expect(dom.querySelector('.ts-pager-last').getAttribute('disabled')).not.toBe('disabled');
				done();
			});
		}, html, done);
	});

	it('should select the last page', function(done) {
		var html = '<div data-ts="Pager" data-ts.pages="8" data-ts.page="7"></div>';
		setup(function(spirit, dom) {
			sometime(function later() {
				expect(dom.querySelector('.ts-selected').innerHTML).toContain('8');
				expect(dom.querySelector('.ts-pager-first').getAttribute('disabled')).not.toBe('disabled');
				expect(dom.querySelector('.ts-pager-prev').getAttribute('disabled')).not.toBe('disabled');
				expect(dom.querySelector('.ts-pager-next').getAttribute('disabled')).toBe('disabled');
				expect(dom.querySelector('.ts-pager-last').getAttribute('disabled')).toBe('disabled');
				done();
			});
		}, html, done);
	});

});

describe('ts.ui.SideBarSpirit', function likethis() {



	// Preparations ..............................................................
	
	function setup(action) {
		var spirit, dom = helper.createTestDom();
		dom.innerHTML = '<aside data-ts="SideBar"><div data-ts="Panel"><p>Leo</p></div></aside>';
		sometime(function later() {
			spirit = ts.ui.get(dom.querySelector('aside'));
			action(spirit);
		});
	}

	it('should (eventually) channel via ts-attribute', function(done) {
		setup(function(spirit) {
			expect(spirit.constructor).toBe(ts.ui.SideBarSpirit);
			expect(spirit.element.innerHTML).toContain('Leo');
			done();
		});
	});

	it('should show a title via DOM attribute', function(done) {
		setup(function(spirit) {
			spirit.element.setAttribute('data-ts.title', 'Daniel');
			sometime(function later() {
				expect(spirit.element.innerHTML).toContain('Daniel');
				done();	
			});
		});
	});

	it('should show a title via API call', function(done) {
		setup(function(spirit) {
			spirit.title('Daniel');
			sometime(function later() {
				expect(spirit.element.innerHTML).toContain('Daniel');
				done();
			});
		});
	});

	it('should show a spinner via DOM attribute', function(done) {
		setup(function(spirit) {
			spirit.element.setAttribute('data-ts.busy', 'Moth');
			sometime(function later() {
				expect(spirit.element.innerHTML).toContain('Moth');
				expect(spirit.element.innerHTML).toContain('ts-spinner-text');
				done();	
			});
		});
	});

	it('should show a button in the header', function(done) {
		setup(function(spirit) {
			spirit.header().buttons.push({
				icon: 'ts-icon-leo'
			});
			sometime(function later() {
				expect(spirit.element.innerHTML).toContain('ts-icon-leo');
				done();	
			});
		});
	});

});

describe('ts.ui.TimeSpirit', function likethis() {
	function setup(action, html) {
		var spirit, dom = helper.createTestDom();
		dom.innerHTML = html;
		sometime(function later(){
			spirit = ts.ui.get(dom.querySelector('time'));
			action(spirit);
		});
	}

	it('should (eventually) channel via ts-attribute', function() {
		setup(function(spirit) {
			expect(spirit.constructor).toBe(ts.ui.TimeSpirit);
		});
	});

	it('should display past time', function() {
		var html = '<time data-ts="Time" datetime="2015-11-04 03:59:33"></time>';
		setup(function(spirit){
			spirit.show();
			expect(spirit.element.innerHTML).toContain('ago');
		}, html);
	});

	it('should display 2 hours ago', function() {
		var html = '<time data-ts="Time" datetime="2015-11-04 03:59:33" realtime="2015-11-04 03:59:35"></time>';
		setup(function(spirit){
			spirit.show();
			expect(spirit.element.innerHTML).toContain('2 hours ago');
		}, html);
	});

	it('should display a day ago', function() {
		var html = '<time data-ts="Time" datetime="a day ago"></time>';
		setup(function(spirit){
			spirit.show();
			expect(spirit.element.innerHTML).toContain('a day ago');
		}, html);
	});
});

describe('ts.ui.AutocompleteInputSpirit', function likethis() {
	var MARKUP = '<input data-ts="AutoComplete" id="myautocomplete" />';
	var dom;

	beforeEach(function dothis() {
		dom = helper.createTestDom();
		dom.innerHTML = MARKUP;
	});

	it('should (eventually) channel via ts-attribute', function(done) {
		sometime(function later() {
			var spirit = ts.ui.get(dom.querySelector('input'));
			expect(spirit.constructor).toBe(ts.ui.AutocompleteInputSpirit);
			done();
		});
	});

	it('should insert the AutocompleteDropdownSpirit (results dropdown)', function(done) {
		sometime(function later() {
			var fake = ts.ui.get(dom.querySelector('input + div'));
			expect(fake.constructor).toBe(ts.ui.AutocompleteDropdownSpirit);
			done();
		});
	});

	/**
	 * @TODO finish these tests
	 */
	
	// describe('> ts.ui.AutocompleteDropdownSpirit', function likethis() {
	// 	beforeEach(function dothis(done) {
	// 		sometime(function later() {
	// 			var autocomplete = ts.ui.get('#myautocomplete');
	// 			autocomplete.data([
	// 				{
	// 					key: 0,
	// 					value: 'zero'
	// 				},
	// 				{
	// 					key: 1,
	// 					value: 'one'
	// 				},
	// 				{
	// 					key: 2,
	// 					value: 'two'
	// 				}
	// 			]);
	// 			done();
	// 		});
	// 	});
	//
	//
	// 	it('should open the results when the field has focus', function(done) {
	// 		console.log('should open the results when the field has focus');
	// 		sometime(function later() {
	// 			console.log('focusing');
	// 			dom.querySelector('#myautocomplete').focus();
	// 			sometime(function later() {
	// 				var resultsList = dom.querySelector('.ts-autocomplete-list');
	// 				expect(resultsList).not.toBeNull();
	// 				expect(resultsList.childElementCount > 0).toBeTruthy();
	// 				done();
	// 			});
	// 		});
	// 	});
	//	
	// 	it('should have the results item on top', function(done) {
	// 		console.log('should have the results item on top');
	// 		dom.querySelector('#myautocomplete').focus();
	// 		sometime(function later() {
	// 			var resultsItem =
	// 				dom.querySelector('.ts-autocomplete-list .ts-autocomplete-results');
	// 			expect(resultsItem.innerHTML).toBe('3 matches');
	// 			done();
	// 		});
	// 	});
	// });
});

describe('ts.ui.DateInputSpirit', function likethis() {

	it('should (eventually) channel via ts-attribute', function(done) {
		var spirit, dom = helper.createTestDom();
		dom.innerHTML = '<input data-ts="DateInput"/>';
		sometime(function later() {
			spirit = ts.ui.get(dom.querySelector('input'));
			expect(spirit.constructor).toBe(ts.ui.DateInputSpirit);
			done();
		});
	});
	
});

describe('ts.ui.FormSpirit', function likethis() {

	it('should (eventually) channel via ts-attribute', function(done) {
		var spirit, dom = helper.createTestDom();
		dom.innerHTML = '<form data-ts="Form"></form>';
		sometime(function later() {
			spirit = ts.ui.get(dom.querySelector('form'));
			expect(spirit.constructor).toBe(ts.ui.FormSpirit);
			done();
		});
	});

	it('should summon with FORM and classname', function() {
		var dom = helper.createTestDom(ts.ui.FormSpirit);
		expect(dom.innerHTML).toContain('<form');
		expect(dom.innerHTML).toContain('ts-form');
	});

	it('should attach a default action', function() {
		var dom = helper.createTestDom(ts.ui.FormSpirit);
		expect(dom.innerHTML).toContain(ts.ui.FormSpirit.ACTION_DEFAULT);
	});

});

describe('ts.ui.FieldSetSpirit', function likethis() {

	it('should (eventually) channel via ts-attribute', function(done) {
		var spirit, dom = helper.createTestDom();
		dom.innerHTML = '<fieldset data-ts="FieldSet"/>';
		sometime(function later() {
			spirit = ts.ui.get(dom.querySelector('fieldset'));
			expect(spirit.constructor).toBe(ts.ui.FieldSetSpirit);
			done();
		});
	});

});

describe('ts.ui.LabelSpirit', function likethis() {

	it('should (eventually) channel via ts-attribute', function(done) {
		var spirit, dom = helper.createTestDom();
		dom.innerHTML = '<input data-ts="Label"/>';
		sometime(function later() {
			spirit = ts.ui.get(dom.querySelector('input'));
			expect(spirit.constructor).toBe(ts.ui.LabelSpirit);
			done();
		});
	});

});

describe('ts.ui.OptionSpirit', function likethis() {
	
	it('should (eventually) channel via ts-attribute', function(done) {
		var spirit, dom = helper.createTestDom();
		dom.innerHTML = '<input type="checkbox" data-ts="Option">';
		sometime(function later() {
			spirit = ts.ui.get(dom.querySelector('input'));
			expect(spirit.constructor).toBe(ts.ui.OptionSpirit);
			done();
		});
	});
	
	it('must fail when not channeled to an INPUT', function() {
		var dom = helper.createTestDom();
		var div = document.createElement('div');
		var err = null;
		try {
			div.setAttribute('data-ts', 'Option');
			dom.appendChild(div);
		} catch(exception) {
			err = exception;
		}
		expect(err).not.toBeNull();
	});

	it('should fail when channeled to an INPUT of wrong type', function() {
		var dom = helper.createTestDom();
		var input = document.createElement('input');
		var err = null;
		try {
			input.setAttribute('data-ts', 'Option');
			input.type = 'text';
			dom.appendChild(input);
		} catch(exception) {
			err = exception;
		}
		expect(err).not.toBeNull();
	});

});

describe('ts.ui.SearchSpirit', function likethis() {

	function setup(action, html, done) {
		var spirit, dom = helper.createTestDom();
		dom.innerHTML = html;
		sometime(function later(){
			spirit = ts.ui.get(dom.querySelector('div[data-ts=Search]'));
			action(spirit, dom);
			done();
		});
	}

	it('should (eventually) channel via ts-attribute', function(done) {
		var html = '<div data-ts="Search"></div>';
		setup(function(spirit, dom){
			sometime(function later() {
				expect(spirit.constructor).toBe(ts.ui.SearchSpirit);
				expect(dom.querySelector('button[ts-button]').innerHTML).toContain('ts-icon-close');
				expect(dom.querySelector('input[ts-input]').value).toBe('');
				expect(spirit.element.className).toContain('ts-empty');
				done();
			});	
		}, html, done);
	});

	it('should contain value', function(done) {
		var html = '<div data-ts="Search"></div>';
		setup(function(spirit, dom){
			spirit.value = 'Leo';
			sometime(function later() {
				expect(dom.querySelector('input[ts-input]').value).toBe('Leo');
				expect(dom.querySelector('button[ts-button]').className).not.toContain('ts-hidden');
				done();
			});	
		}, html, done);
	});

});

describe('ts.ui.SelectSpirit', function likethis() {

	var MARKUP = [
		'<select data-ts="Select">',
			'<option value="1">One</option>',
			'<option value="2">Two</option>',
			'<option value="3">Three</option>',
		'</select>'
	].join('\n');

	it('should (eventually) channel via ts-attribute', function(done) {
		var spirit, dom = helper.createTestDom();
		dom.innerHTML = MARKUP;
		sometime(function later() {
			spirit = ts.ui.get(dom.querySelector('select'));
			expect(spirit.constructor).toBe(ts.ui.SelectSpirit);
			done();
		});
	});

	it('should insert the FakeSelectInputSpirit (fake select)', function(done) {
		var spirit, dom = helper.createTestDom();
		dom.innerHTML = MARKUP;
		sometime(function later() {
			var fake = ts.ui.get(dom.querySelector('select + input'));
			expect(fake.constructor).toBe(ts.ui.FakeSelectInputSpirit);
			done();
		});
	});

});

describe('ts.ui.SwitchSpirit', function likethis() {

	it('should (eventually) channel via ts-attribute', function(done) {
		var spirit, dom = helper.createTestDom();
		dom.innerHTML = '<select data-ts="Select"/>';
		sometime(function later() {
			spirit = ts.ui.get(dom.querySelector('select'));
			expect(spirit.constructor).toBe(ts.ui.SelectSpirit);
			done();
		});
	});

	it('must fail when not channeled to an INPUT', function() {
		var dom = helper.createTestDom();
		var div = document.createElement('div');
		var err = null;
		try {
			div.setAttribute('data-ts', 'Switch');
			dom.appendChild(div);
		} catch(exception) {
			err = exception;
		}
		expect(err).not.toBeNull();
	});

	it('should fail when channeled to an INPUT of wrong type', function() {
		var dom = helper.createTestDom();
		var input = document.createElement('input');
		var err = null;
		try {
			input.setAttribute('data-ts', 'Switch');
			input.type = 'text';
			dom.appendChild(input);
		} catch(exception) {
			err = exception;
		}
		expect(err).not.toBeNull();
	});

});

describe('ts.ui.TextAreaSpirit', function likethis() {

	it('should (eventually) channel via ts-attribute', function(done) {
		var spirit, dom = helper.createTestDom();
		dom.innerHTML = '<textarea data-ts="TextArea"/>';
		sometime(function later() {
			spirit = ts.ui.get(dom.querySelector('textarea'));
			expect(spirit.constructor).toBe(ts.ui.TextAreaSpirit);
			done();
		});
	});

	/*
	 * TODO: REACTIVATE WHEN NUMBER AND OTHERS ARE FIXED
	it('must fail when not channeled to an INPUT or TEXTAREA', function() {
		var dom = helper.createTestDom();
		var div = document.createElement('div');
		var err = null;
		try {
			div.setAttribute('ts-textarea', 'ts-textarea');
			dom.appendChild(div);
		} catch(exception) {
			err = exception;
		}
		expect(err).not.toBeNull();
	});
	*/

});

describe('ts.ui.TextInputSpirit', function likethis() {

	it('should (eventually) channel via ts-attribute', function(done) {
		var spirit, dom = helper.createTestDom();
		dom.innerHTML = '<input data-ts="Input"/>';
		sometime(function later() {
			spirit = ts.ui.get(dom.querySelector('input'));
			expect(spirit.constructor).toBe(ts.ui.TextInputSpirit);
			done();
		});
	});

	/*
	 * TODO: REACTIVATE WHEN NUMBER INPUT IS FIXED
	it('should fail when not channeled to an INPUT or TEXTAREA', function() {
		var dom = helper.createTestDom();
		var div = document.createElement('div');
		var err = null;
		try {
			div.setAttribute('ts-input', 'ts-input');
			dom.appendChild(div);
		} catch(exception) {
			err = exception;
		}
		expect(err).not.toBeNull();
	});
	
	it('should fail when channeled to an INPUT of wrong type', function() {
		var dom = helper.createTestDom();
		var input = document.createElement('input');
		var err = null;
		try {
			input.setAttribute('ts-input', 'ts-input');
			input.type = 'checkbox';
			dom.appendChild(input);
		} catch(exception) {
			err = exception;
		}
		expect(err).not.toBeNull();
	});
	*/
});

describe('ts.ui.CompanyCardSpirit', function likethis() {

	var CARDDATA = {
		id: "6bf17754-f9de-4e31-aa31-bd3ff765b9c2",
		data: {
			name: "Tradeshift",
			logo: "assets/logo.png",
			size: '100–249',
			location: "San Francisco, California",
			industry: 'Software & IT',
			connection: 2
		}
	};

	it('should (eventually) channel via ts-attribute', function(done) {
		var spirit, dom = helper.createTestDom();
		dom.innerHTML = '<div data-ts="CompanyCard"></div>';
		sometime(function later() {
			spirit = ts.ui.get(dom.querySelector('div'));
			expect(spirit.constructor).toBe(ts.ui.CompanyCardSpirit);
			done();
		});
	});
	
	it('should generate HTML via .render(json)', function(done) {
		var spirit, dom = helper.createTestDom();
		dom.innerHTML = '<div data-ts="CompanyCard"></div>';
		sometime(function later() {
			spirit = ts.ui.get(dom.querySelector('div'));
			spirit.render(CARDDATA);
			var html = spirit.element.innerHTML.replace(/&amp;/g, '&');
			Object.keys(CARDDATA.data).forEach(function(key) {
				if(key === 'connection') {
					expect(html).toContain('Connected');
				} else {
					var value = CARDDATA.data[key];
					expect(html).toContain(value);
				}
			});
			done();
		});
	});

	it('should generate HTML via ts.render="encodedjson"', function(done) {
		var spirit, dom = helper.createTestDom();
		var encodedjson = encodeURIComponent(JSON.stringify(CARDDATA).trim());
		dom.innerHTML = '<div data-ts="CompanyCard" data-ts.render="' + encodedjson + '"></div>';
		sometime(function later() {
			spirit = ts.ui.get(dom.querySelector('div'));
			var html = spirit.element.innerHTML.replace(/&amp;/g, '&');
			Object.keys(CARDDATA.data).forEach(function(key) {
				if(key === 'connection') {
					expect(html).toContain('Connected');
				} else {
					var value = CARDDATA.data[key];
					expect(html).toContain(value);
				}
			});
			done();
		});
	});

});

describe('ts.ui.CompanyCardSpirit', function likethis() {
	it('should open an aside', function() {
		ts.ui.UserCard({
			id: '6bf17754-f9de-4e31-aa31-bd3ff765b9c2',
			data: {
				name: 'Wired Earp',
				image: 'assets/wiredearp.jpg',
				title: 'EDB Programmer',
				role: 'Gentleman Spy',
				email: 'jmo@tradeshift.com',
				company: 'Tradeshift',
				companyUrl: 'http://tradeshift.com/'
			}
		}).open();

		sometime(function later(){
			var aside = document.querySelector('aside[data-ts=Aside]');
			expect(aside.innerHTML).toContain('Wired Earp');
			expect(aside.innerHTML).toContain('EDB Programmer');
			expect(aside.innerHTML).toContain('Gentleman Spy');
			expect(aside.innerHTML).toContain('jmo@tradeshift.com');
			expect(aside.innerHTML).toContain('Tradeshift');
			expect(aside.innerHTML).toContain('http://tradeshift.com/');
		});
	});
});

describe('ts.ui.UserImageSpirit', function likethis() {

	function setup(action, html, done) {
		var spirit, dom = helper.createTestDom();
		dom.innerHTML = html;
		sometime(function later(){
			spirit = ts.ui.get(dom.querySelector('img[data-ts=UserImage]'));
			action(spirit, dom);
			done();
		});
	}

	it('should (eventually) channel via ts-attribute', function(done) {
		var html = '<img data-ts="UserImage" alt="Karl Benson"/>';
		setup(function(spirit, dom){
			sometime(function later() {
				expect(spirit.constructor).toBe(ts.ui.UserImageSpirit);
				expect(spirit.element.className).toContain('ts-userimage');
				done();
			});	
		}, html, done);
	});

	it('should have title', function(done) {
		var html = '<img data-ts="UserImage" alt="Karl Benson"/>';
		setup(function(spirit, dom){
			sometime(function later() {
				expect(spirit.element.getAttribute('title')).toBe('Karl Benson');
				done();
			});	
		}, html, done);
	});

});

describe('ts.ui.TableSpirit', function likethis() {

	function setup(action) {
		var spirit, dom = helper.createTestDom();
		dom.innerHTML = '<div data-ts="Table"></div>';
		sometime(function later(){
			spirit = ts.ui.get(dom.querySelector('div[data-ts=Table]'));
			action(spirit, dom);
		});
	}

	describe('Build', function() {
		it('should (eventually) channel via ts-attribute', function(done) {
			setup(function(spirit, dom){
				sometime(function later() {
					expect(spirit.constructor).toBe(ts.ui.TableSpirit);
					done();
				});	
			});
		});

		it('should contain rows and columns', function(done) {
			setup(function(spirit, dom){
				spirit.cols(['One', 'Two', 'Three']);
				spirit.rows([
					['A', 'D', 'G'],
					['B', 'E', 'H'],
					['C', 'F', 'I']
				]);
				sometime(function later() {
					expect(spirit.element.innerHTML).toContain('One');
					expect(spirit.element.innerHTML).toContain('A');
					done();
				});	
			});
		});

		it('should declare columns as objects', function(done) {
			setup(function(spirit, dom){
				spirit.cols([{label: 'Moth'},{label: 'Daniel'},{label: 'Leo'}]);
				sometime(function later() {
					expect(spirit.element.innerHTML).toContain('Moth');
					expect(spirit.element.innerHTML).toContain('Daniel');
					expect(spirit.element.innerHTML).toContain('Leo');
					done();
				});	
			});
		});

		it('should set the type property to ts-number', function(done) {
			setup(function(spirit, dom){
				spirit.cols([{ label: 'Type' },{ label: 'Value', type: 'ts-number'}]);
				spirit.rows([['Random number', Math.random()]]);
				sometime(function later() {
					expect(spirit.element.innerHTML).toContain('ts-number');
					done();
				});	
			});
		});

		it('should mark the row as selected', function(done) {
			setup(function(spirit, dom){
				spirit.selectable().rows([
					{ cells: ['A', 'D', 'G'], selected: true},
					{ cells: ['B', 'E', 'H']},
					{ cells: ['C', 'F', 'I']},
				]);
				sometime(function later() {
					expect(spirit.element.innerHTML).toContain('ts-icon-checkboxon');
					done();
				});	
			});
		});

		it('should show the displayed text', function(done) {
			setup(function(spirit, dom){
				spirit.rows([{
					cells: [
					{value: 1, text: 'One'},
					{value: 2, text: 'Two'},
					{value: 3, text: 'Three'}
				]}]);
				sometime(function later() {
					expect(spirit.element.innerHTML).toContain('One');
					expect(spirit.element.innerHTML).toContain('Two');
					expect(spirit.element.innerHTML).toContain('Three');
					done();
				});	
			});
		});

		it('should update a single row', function(done) {
			setup(function(spirit, dom){
				spirit.rows([
					['One', 'Two', 'Three'],
					['Four', 'Five', 'Six']
				]);
				spirit.row(1,['Moth', 'Daniel', 'Leo']);
				sometime(function later() {
					expect(spirit.element.innerHTML).toContain('Moth');
					expect(spirit.element.innerHTML).toContain('Daniel');
					expect(spirit.element.innerHTML).toContain('Leo');
					expect(spirit.element.innerHTML).not.toContain('Four');
					expect(spirit.element.innerHTML).not.toContain('Five');
					expect(spirit.element.innerHTML).not.toContain('Six');
					done();
				});	
			});
		});

		it('should update a single cell', function(done) {
			setup(function(spirit, dom){
				spirit.rows([
					['A', 'B', 'C'],
					['D', 'E', 'F']
				]);
				spirit.cell(1, 1, 'Moth');
				sometime(function later() {
					expect(spirit.element.innerHTML).toContain('Moth');
					expect(spirit.element.innerHTML).not.toContain('E');
					done();
				});	
			});
		});

		it('should use array methods', function(done) {
			setup(function(spirit, dom){
				spirit.rows().push(['Moth', 'Daniel', 'Leo']);
				sometime(function later() {
					expect(spirit.element.innerHTML).toContain('Moth');
					expect(spirit.element.innerHTML).toContain('Daniel');
					expect(spirit.element.innerHTML).toContain('Leo');
					done();
				});	
			});
		});
	});

	describe('Layout', function() {
		it('should flex relative to other columns', function(done) {
			setup(function(spirit, dom){
				spirit.cols([
					{label: 'Level', type: 'ts-number'},
					{label: 'Character', flex: 2}
				]);
				spirit.rows([
					[21, 'Paladin Knight', 'Lawful Good'],
					[13, 'Barbarian Queen', 'Neutral Evil']
				]);
				sometime(function later() {
					var w1 = dom.querySelector('.ts-number').offsetWidth;
					var w2 = dom.querySelector('.ts-text').offsetWidth;
					expect(w1 * 2).toBeGreaterThan(w2 - 2);
					done();
				});	
			});
		});

		it('should run into truncated text', function(done) {
			setup(function(spirit, dom){
				spirit.cols([
					{label: 'Level', type: 'ts-number'},
					{label: 'Character', flex: 2, wrap: true}
				]);
				spirit.rows([
					[21, 'Paladin Knight', 'Lawful Good'],
					[13, 'Global Senior Vice President of Sales', 'Neutral Evil']
				]);
				sometime(function later() {
					expect(spirit.element.innerHTML).toContain('ts-wrap');
					done();
				});	
			});
		});

		it('should assign it a minsize in pixels', function(done) {
			setup(function(spirit, dom){
				spirit.cols([
					{label: 'Level', type: 'ts-number', minwidth: 200},
					{label: 'Character'}
				]);
				spirit.rows([
					[21, 'Paladin Knight', 'Lawful Good'],
					[13, 'Global Senior Vice President of Sales', 'Neutral Evil']
				]);
				sometime(function later() {
					expect(dom.querySelector('.ts-number').offsetWidth).toBeGreaterThan(199);
					done();
				});	
			});
		});
	});

	describe('Style', function() {
		it('type property should works as a classname for toth header and cells', function(done) {
			setup(function(spirit, dom){
				spirit.cols([
					{label: 'Level', type: 'ts-number your-class'},
					{label: 'Character', type: 'ts-number your-class'}
				]);
				spirit.rows([
					[21, 22],
					[13, 22]
				]);
				sometime(function later() {
					expect(spirit.element.innerHTML).toContain('your-class');
					done();
				});	
			});
		});

		it('should works for the rows', function(done) {
			setup(function(spirit, dom){
				spirit.rows([
					{ cells: ['A', 'D', 'G'], type: 'pale-red'},
					{ cells: ['B', 'E', 'H'], type: 'pale-green'},
					{ cells: ['C', 'F', 'I'], type: 'pale-blue'},
				]);
				sometime(function later() {
					expect(spirit.element.innerHTML).toContain('pale-red');
					expect(spirit.element.innerHTML).toContain('pale-green');
					expect(spirit.element.innerHTML).toContain('pale-blue');
					done();
				});	
			});
		});

		it('should works for the cells', function(done) {
			setup(function(spirit, dom){
				spirit.rows([
					{
						cells: [
							{text: 'Normal'},
							{text: 'Normal'},
							{text: 'Special', type: 'very-special'}
						]
					}
				]);
				sometime(function later() {
					expect(spirit.element.innerHTML).toContain('very-special');
					done();
				});	
			});
		});
	});

	describe('Page', function() {
		it('should create the page automatically', function(done) {
			setup(function(spirit, dom){
				spirit.cols([
					{label: 'Level', type: 'ts-number your-class'},
					{label: 'Character', type: 'ts-number your-class'}
				]);
				spirit.rows([
					[21, 22],
					[21, 22],
					[21, 22],
					[21, 22],
					[21, 22],
					[21, 22],
					[13, 22]
				]).max(5);
				sometime(function later() {
					expect(spirit.element.innerHTML).toContain('ts-toolbar-pager');
					done();
				});	
			});
		});

		it('should create the page by api', function(done) {
			setup(function(spirit, dom){
				spirit.max(3).cols([
					{label: 'Level', type: 'ts-number your-class'},
					{label: 'Character', type: 'ts-number your-class'}
				]);
				spirit.pager({
					pages: 5,
					page: 0
				});
				sometime(function later() {
					expect(spirit.element.innerHTML).toContain('ts-toolbar-pager');
					done();
				});	
			});
		});
	});

	describe('Format', function() {
		it('should support a simple subset of markdown', function(done) {
			setup(function(spirit, dom){
				spirit.rows([
					['*Italic text*'],
					['**Strong text**'],
					['~~Strike text~~'],
					['`monotype text`']
				]);
				sometime(function later() {
					expect(spirit.element.innerHTML).toContain('</em>');
					expect(spirit.element.innerHTML).toContain('</strong>');
					expect(spirit.element.innerHTML).toContain('</del>');
					expect(spirit.element.innerHTML).toContain('</code>');
					done();
				});	
			});
		});

		it('should support link', function(done) {
			setup(function(spirit, dom){
				spirit.linkable();
				spirit.rows([
					['Please visit (Tradeshift)[http://www.tradeshift.com]']
				]);
				sometime(function later() {
					expect(spirit.element.innerHTML).toContain('Tradeshift</a>');
					done();
				});	
			});
		});
	});

	describe('Sort', function() {
		it('should sortable', function(done) {
			setup(function(spirit, dom){
				spirit.cols(
					['Animal', {label: 'Price', type: 'ts-number'}]
				).rows([
					['Donkey', 700],
					['Baboon', 1500],
					['Coyote', 250],
					['Albatross', 50]
				]).sortable(function(index, ascending) {
					spirit.sort(index, ascending);
				});
				spirit.sort(0, true);
				sometime(function later() {
					expect(spirit.element.innerHTML).toContain('ts-icon-triangledown');
					done();
				});	
			});
		});
	});

	describe('Select', function() {
		it('should clickable', function(done) {
			var select = null;
			setup(function(spirit, dom){
				spirit.rows([
					['A', 'E', 'I'],
					['B', 'F', 'J'],
					['C', 'G', 'K'],
					['D', 'H', 'L'],
				]);
				spirit.selectable(function(selected, unselected){
					select = selected;
				});
				spirit.select(0);
				sometime(function later() {
					expect(select).toEqual([0]);
					done();
				});	
			});
		});

		it('should clickable', function(done) {
			var select = null;
			var unselect = null;
			setup(function(spirit, dom){
				spirit.rows([
					{cells: ['A', 'D', 'G'], selected: true},
					{cells: ['B', 'E', 'H']},
					{cells: ['C', 'F', 'I']},
				]);
				spirit.selectable(function(selected, unselected){
					select = selected;
					unselect = unselected;
				});
				spirit.toggle();
				sometime(function later() {
					expect(select).toEqual([1,2]);
					expect(unselect).toEqual([0]);
					done();
				});	
			});
		});

		it('should retrieve the selected indexes (as an array) with the selected method', function(done) {
			setup(function(spirit, dom){
				spirit.selectable().rows([
					{cells: ['A', 'D', 'G'], selected: true},
					{cells: ['B', 'E', 'H'], selected: true},
					{cells: ['C', 'F', 'I']},
				]);
				
				sometime(function later() {
					expect(spirit.selected()).toEqual([0,1]);
					done();
				});	
			});
		});

		it('should confirm selection by passing one or more indexes (or an array)', function(done) {
			setup(function(spirit, dom){
				spirit.selectable().rows([
					{cells: ['A', 'D', 'G'], selected: true},
					{cells: ['B', 'E', 'H'], selected: true},
					{cells: ['C', 'F', 'I']},
				]);
				
				sometime(function later() {
					expect(spirit.selected([0,1])).toEqual(true);
					done();
				});	
			});
		});

		it('should get a selection menu in the header', function(done) {
			setup(function(spirit, dom){
				spirit.selectable().rows([
					{cells: ['A', 'D', 'G']},
					{cells: ['B', 'E', 'H']},
					{cells: ['C', 'F', 'I']},
				]);

				spirit.cols(['One', 'Two', 'Three']);
				
				sometime(function later() {
					expect(dom.querySelector('header').innerHTML).toContain('ts-table-checkbox');
					done();
				});	
			});
		});
	});

	describe('Search', function() {
		it('should setup a SearchModel for any column via the search property', function(done) {
			setup(function(spirit, dom){
				spirit.cols(
					['Animal', {label: 'Price', type: 'ts-number', search: {
						tip: "Leo"
					}}]
				).rows([
					['Donkey', 700],
					['Baboon', 1500],
					['Coyote', 250],
					['Albatross', 50]
				]);
				sometime(function later() {
					expect(spirit.element.innerHTML).toContain('data-ts="Search"');
					expect(spirit.element.innerHTML).toContain('Leo');
					done();
				});	
			});
		});
	});

	describe('Edit', function() {
		it('should editable', function(done) {
			setup(function(spirit, dom){
				spirit.rows([
					['Single asterisks is used for *italic text*'],
					['Double asterisks is used for **strong text**'],
					['Single backtick is used for `monotype text`'],
					['Double tilde can be used to ~~Strike text~~']
				]).editable();
				sometime(function later() {
					expect(spirit.element.innerHTML).toContain('textarea');
					done();
				});	
			});
		});

		it('All cells are assumed editable unless negated in the column definition', function(done) {
			setup(function(spirit, dom){
				spirit.cols([
					{label: 'Don\'t edit!', editable: false}
				]).rows([
					['X']
				]).editable();
				sometime(function later() {
					expect(spirit.element.innerHTML).not.toContain('textarea');
					done();
				});	
			});
		});

		it('disable editing per row', function(done) {
			setup(function(spirit, dom){
				spirit.rows([
					{ cells: ['X', 'X', 'X'], editable: false}
				]).editable();
				sometime(function later() {
					expect(spirit.element.innerHTML).not.toContain('textarea');
					done();
				});	
			});
		});
	});

	describe('Filter', function() {
		it('should support a button which can be assigned an icon and an onclick method', function(done) {
			setup(function(spirit, dom){
				spirit.cols([
					{
						label: 'Hello',
						type: 'ts-number',
						button: {
							icon: 'ts-icon-addfilter',
							onclick: function() {
							}
						}
					}
				]);
				sometime(function later() {
					expect(spirit.element.innerHTML).toContain('ts-icon-addfilter');
					done();
				});	
			});
		});

		it('should change the icon and the onclick method as often as you like', function(done) {
			setup(function(spirit, dom){
				spirit.cols([
					{
						label: 'Hello',
						type: 'ts-number',
						button: {
							icon: 'ts-icon-addfilter',
							onclick: function() {
							}
						}
					}
				]);
				spirit.cols()[0].button.icon = 'ts-icon-view';
				sometime(function later() {
					expect(spirit.element.innerHTML).toContain('ts-icon-view');
					expect(spirit.element.innerHTML).not.toContain('ts-icon-addfilter');
					done();
				});	
			});
		});
	});

	describe('Config', function() {
		it('should make the table configurable by a button in the statusbar', function(done) {
			setup(function(spirit, dom){
				spirit.configurable(function onclick() {
				}).cols(['A', 'B', 'C', 'D']).rows([
					[1, 4, 7, 10],
					[2, 5, 8, 11],
					[3, 6, 9, 12]
				]);
				sometime(function later() {
					expect(spirit.element.innerHTML).toContain('ts-icon-settings');
					done();
				});	
			});
		});
	});

	describe('Status', function() {
		it('should show a message in the lower left corner', function(done) {
			setup(function(spirit, dom){
				spirit.rows([
					[1, 4, 7],
					[2, 5, 8],
					[3, 6, 9]
				]);
				spirit.status('leo');
				sometime(function later() {
					expect(spirit.element.innerHTML).toContain('leo');
					done();
				});	
			});
		});
	});

});
