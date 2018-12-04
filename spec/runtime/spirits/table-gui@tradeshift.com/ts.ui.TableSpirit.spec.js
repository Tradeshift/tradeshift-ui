describe('ts.ui.TableSpirit', function likethis() {
	function setup(action) {
		var spirit,
			dom = helper.createTestDom();
		dom.innerHTML = '<div data-ts="Table"></div>';
		sometime(function later() {
			spirit = ts.ui.get(dom.querySelector('div[data-ts=Table]'));
			action(spirit, dom);
		});
	}

	describe('Build', function() {
		it('should (eventually) channel via ts-attribute', function(done) {
			setup(function(spirit, dom) {
				sometime(function later() {
					expect(spirit.constructor).toBe(ts.ui.TableSpirit);
					done();
				});
			});
		});

		it('should contain rows and columns', function(done) {
			setup(function(spirit, dom) {
				spirit.cols(['One', 'Two', 'Three']);
				spirit.rows([['A', 'D', 'G'], ['B', 'E', 'H'], ['C', 'F', 'I']]);
				sometime(function later() {
					expect(spirit.element.innerHTML).toContain('One');
					expect(spirit.element.innerHTML).toContain('A');
					done();
				});
			});
		});

		it('should declare columns as objects', function(done) {
			setup(function(spirit, dom) {
				spirit.cols([{ label: 'Moth' }, { label: 'Daniel' }, { label: 'Leo' }]);
				sometime(function later() {
					expect(spirit.element.innerHTML).toContain('Moth');
					expect(spirit.element.innerHTML).toContain('Daniel');
					expect(spirit.element.innerHTML).toContain('Leo');
					done();
				});
			});
		});

		it('should set the type property to ts-number', function(done) {
			setup(function(spirit, dom) {
				spirit.cols([{ label: 'Type' }, { label: 'Value', type: 'ts-number' }]);
				spirit.rows([['Random number', Math.random()]]);
				sometime(function later() {
					expect(spirit.element.innerHTML).toContain('ts-number');
					done();
				});
			});
		});

		it('should mark the row as selected and then unselect', function(done) {
			setup(function(spirit, dom) {
				spirit
					.selectable()
					.rows([
						{ cells: ['A', 'D', 'G'], selected: true },
						{ cells: ['B', 'E', 'H'] },
						{ cells: ['C', 'F', 'I'] }
					]);
				sometime(function later() {
					expect(spirit.element.innerHTML).toContain('ts-icon-checkboxon');
					var icon = spirit.element.querySelector('.ts-icon-checkboxon');
					var butt = icon.parentNode;
					butt.click();
					sometime(function evenlater() {
						expect(spirit.element.innerHTML).not.toContain('ts-icon-checkboxon');
						done();
					});
				});
			});
		});

		it('should show the displayed text', function(done) {
			setup(function(spirit, dom) {
				spirit.rows([
					{
						cells: [
							{ value: 1, text: 'One' },
							{ value: 2, text: 'Two' },
							{ value: 3, text: 'Three' }
						]
					}
				]);
				sometime(function later() {
					expect(spirit.element.innerHTML).toContain('One');
					expect(spirit.element.innerHTML).toContain('Two');
					expect(spirit.element.innerHTML).toContain('Three');
					done();
				});
			});
		});

		it('should update a single row', function(done) {
			setup(function(spirit, dom) {
				spirit.rows([['One', 'Two', 'Three'], ['Four', 'Five', 'Six']]);
				spirit.row(1, ['Moth', 'Daniel', 'Leo']);
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
			setup(function(spirit, dom) {
				spirit.rows([['A', 'B', 'C'], ['D', 'E', 'F']]);
				spirit.cell(1, 1, 'Moth');
				sometime(function later() {
					expect(spirit.element.innerHTML).toContain('Moth');
					expect(spirit.element.innerHTML).not.toContain('E');
					done();
				});
			});
		});

		it('should use array methods', function(done) {
			setup(function(spirit, dom) {
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
			setup(function(spirit, dom) {
				spirit.cols([{ label: 'Level', type: 'ts-number' }, { label: 'Character', flex: 2 }]);
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
			setup(function(spirit, dom) {
				spirit.cols([
					{ label: 'Level', type: 'ts-number' },
					{ label: 'Character', flex: 2, wrap: true }
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
			setup(function(spirit, dom) {
				spirit.cols([{ label: 'Level', type: 'ts-number', minwidth: 200 }, { label: 'Character' }]);
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
			setup(function(spirit, dom) {
				spirit.cols([
					{ label: 'Level', type: 'ts-number your-class' },
					{ label: 'Character', type: 'ts-number your-class' }
				]);
				spirit.rows([[21, 22], [13, 22]]);
				sometime(function later() {
					expect(spirit.element.innerHTML).toContain('your-class');
					done();
				});
			});
		});

		it('should works for the rows', function(done) {
			setup(function(spirit, dom) {
				spirit.rows([
					{ cells: ['A', 'D', 'G'], type: 'pale-red' },
					{ cells: ['B', 'E', 'H'], type: 'pale-green' },
					{ cells: ['C', 'F', 'I'], type: 'pale-blue' }
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
			setup(function(spirit, dom) {
				spirit.rows([
					{
						cells: [
							{ text: 'Normal' },
							{ text: 'Normal' },
							{ text: 'Special', type: 'very-special' }
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
			setup(function(spirit, dom) {
				spirit.cols([
					{ label: 'Level', type: 'ts-number your-class' },
					{ label: 'Character', type: 'ts-number your-class' }
				]);
				spirit.rows([[21, 22], [21, 22], [21, 22], [21, 22], [21, 22], [21, 22], [13, 22]]).max(5);
				sometime(function later() {
					expect(spirit.element.innerHTML).toContain('ts-toolbar-pager');
					done();
				});
			});
		});

		it('should create the page by api', function(done) {
			setup(function(spirit, dom) {
				spirit
					.max(3)
					.cols([
						{ label: 'Level', type: 'ts-number your-class' },
						{ label: 'Character', type: 'ts-number your-class' }
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
			setup(function(spirit, dom) {
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
			setup(function(spirit, dom) {
				spirit.linkable();
				spirit.rows([['Please visit [Tradeshift](http://www.tradeshift.com)']]);
				sometime(function later() {
					expect(spirit.element.innerHTML).toContain('Tradeshift</a>');
					done();
				});
			});
		});

		it('should support link(old syntax)', function(done) {
			setup(function(spirit, dom) {
				spirit.linkable();
				spirit.rows([['Please visit (Tradeshift)[http://www.tradeshift.com]']]);
				sometime(function later() {
					expect(spirit.element.innerHTML).toContain('Tradeshift</a>');
					done();
				});
			});
		});
		it('should support () in the text of the link markdown', function(done) {
			setup(function(spirit, dom) {
				spirit.linkable();
				spirit.rows([['Please visit (Trade(s)hift)[http://www.tradeshift.com]']]);
				sometime(function later() {
					expect(spirit.element.innerHTML).toContain('Trade(s)hift</a>');
					done();
				});
			});
		});
		it('should support () in the text of the link markdown(new syntax)', function(done) {
			setup(function(spirit, dom) {
				spirit.linkable();
				spirit.rows([['Please visit [Trade(s)hift](http://www.tradeshift.com)']]);
				sometime(function later() {
					expect(spirit.element.innerHTML).toContain('Trade(s)hift</a>');
					done();
				});
			});
		});

		it('should get right text of the link markdown ', function(done) {
			setup(function(spirit, dom) {
				spirit.linkable();
				spirit.rows([['Please (visit)[Trade(s)hift](http://www.tradeshift.com)']]);
				sometime(function later() {
					expect(spirit.element.innerHTML).toContain('(visit)<a');
					done();
				});
			});
		});
	});

	describe('Sort', function() {
		it('should be sortable', function(done) {
			setup(function(spirit, dom) {
				spirit
					.cols(['Animal', { label: 'Price', type: 'ts-number' }])
					.rows([['Donkey', 700], ['Baboon', 1500], ['Coyote', 250], ['Albatross', 50]])
					.sortable(function(index, ascending) {
						spirit.sort(index, ascending);
					});
				spirit.sort(0, true);
				sometime(function later() {
					expect(spirit.element.innerHTML).toContain('ts-icon-triangledown');
					done();
				});
			});
		});
		it('should sort table extras', function(done) {
			function indexes(spirit) {
				var table = spirit.dom.q('.ts-table-body table');
				return gui.Array.from(table.rows).map(function(row) {
					return row.cells[0].textContent;
				});
			}
			setup(function(spirit, dom) {
				spirit
					.cols(['Letters', 'Extras'])
					.rows([
						['A', geticon('ts-icon-sales', 3)],
						['B', getswitch('toggle', 1)],
						['C', getuserimage('Jim Bob Johnson', 4)],
						['D', geticon('ts-icon-sales', 2)]
					])
					.sortable();
				spirit.sort(1, true);
				sometime(function later() {
					expect(indexes(spirit)).toEqual(['B', 'D', 'A', 'C']);
					spirit.sort(1, false);
					sometime(function later() {
						expect(indexes(spirit)).toEqual(['C', 'A', 'D', 'B']);
						done();
					});
				});
			});
		});
	});

	describe('Select', function() {
		it('should be clickable', function(done) {
			var select = null;
			setup(function(spirit, dom) {
				spirit.rows([['A', 'E', 'I'], ['B', 'F', 'J'], ['C', 'G', 'K'], ['D', 'H', 'L']]);
				spirit.selectable(function(selected, unselected) {
					select = selected;
				});
				spirit.select(0);
				sometime(function later() {
					expect(select).toEqual([0]);
					done();
				});
			});
		});

		it('should be clickable', function(done) {
			var select = null;
			var unselect = null;
			setup(function(spirit, dom) {
				spirit.rows([
					{ cells: ['A', 'D', 'G'], selected: true },
					{ cells: ['B', 'E', 'H'] },
					{ cells: ['C', 'F', 'I'] }
				]);
				spirit.selectable(function(selected, unselected) {
					select = selected;
					unselect = unselected;
				});
				spirit.toggle();
				sometime(function later() {
					expect(select).toEqual([1, 2]);
					expect(unselect).toEqual([0]);
					done();
				});
			});
		});

		it('should retrieve the selected indexes (as an array) with the selected method', function(done) {
			setup(function(spirit, dom) {
				spirit
					.selectable()
					.rows([
						{ cells: ['A', 'D', 'G'], selected: true },
						{ cells: ['B', 'E', 'H'], selected: true },
						{ cells: ['C', 'F', 'I'] }
					]);

				sometime(function later() {
					expect(spirit.selected()).toEqual([0, 1]);
					done();
				});
			});
		});

		it('should confirm selection by passing one or more indexes (or an array)', function(done) {
			setup(function(spirit, dom) {
				spirit
					.selectable()
					.rows([
						{ cells: ['A', 'D', 'G'], selected: true },
						{ cells: ['B', 'E', 'H'], selected: true },
						{ cells: ['C', 'F', 'I'] }
					]);

				sometime(function later() {
					expect(spirit.selected([0, 1])).toEqual(true);
					done();
				});
			});
		});

		it('should get a selection menu in the header', function(done) {
			setup(function(spirit, dom) {
				spirit
					.selectable()
					.rows([
						{ cells: ['A', 'D', 'G'] },
						{ cells: ['B', 'E', 'H'] },
						{ cells: ['C', 'F', 'I'] }
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
			setup(function(spirit, dom) {
				spirit
					.cols([
						'Animal',
						{
							label: 'Price',
							type: 'ts-number',
							search: {
								info: 'Leo'
							}
						}
					])
					.rows([['Donkey', 700], ['Baboon', 1500], ['Coyote', 250], ['Albatross', 50]]);
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
			setup(function(spirit, dom) {
				spirit
					.rows([
						['Single asterisks is used for *italic text*'],
						['Double asterisks is used for **strong text**'],
						['Single backtick is used for `monotype text`'],
						['Double tilde can be used to ~~Strike text~~']
					])
					.editable();
				sometime(function later() {
					expect(spirit.element.innerHTML).toContain('textarea');
					done();
				});
			});
		});

		it('All cells are assumed editable unless negated in the column definition', function(done) {
			setup(function(spirit, dom) {
				spirit
					.cols([{ label: "Don't edit!", editable: false }])
					.rows([['X']])
					.editable();
				sometime(function later() {
					expect(spirit.element.innerHTML).not.toContain('textarea');
					done();
				});
			});
		});

		it('disable editing per row', function(done) {
			setup(function(spirit, dom) {
				spirit.rows([{ cells: ['X', 'X', 'X'], editable: false }]).editable();
				sometime(function later() {
					expect(spirit.element.innerHTML).not.toContain('textarea');
					done();
				});
			});
		});
	});

	describe('Filter', function() {
		it('should support a button which can be assigned an icon and an onclick method', function(done) {
			setup(function(spirit, dom) {
				spirit.cols([
					{
						label: 'Hello',
						type: 'ts-number',
						button: {
							icon: 'ts-icon-addfilter',
							onclick: function() {}
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
			setup(function(spirit, dom) {
				spirit.cols([
					{
						label: 'Hello',
						type: 'ts-number',
						button: {
							icon: 'ts-icon-addfilter',
							onclick: function() {}
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
			setup(function(spirit, dom) {
				spirit
					.configbutton(function onclick() {})
					.cols(['A', 'B', 'C', 'D'])
					.rows([[1, 4, 7, 10], [2, 5, 8, 11], [3, 6, 9, 12]]);
				sometime(function later() {
					expect(spirit.element.innerHTML).toContain('ts-icon-settings');
					done();
				});
			});
		});
	});

	describe('Status', function() {
		it('should show a message in the lower left corner', function(done) {
			setup(function(spirit, dom) {
				spirit.rows([[1, 4, 7], [2, 5, 8], [3, 6, 9]]);
				spirit.status('leo');
				sometime(function later() {
					expect(spirit.element.innerHTML).toContain('leo');
					done();
				});
			});
		});
	});
});

function geticon(type, value) {
	return {
		item: 'Icon',
		type: type,
		value: value
	};
}
function getswitch(name, value) {
	return {
		item: 'Switch',
		name: name,
		value: value
	};
}
function getuserimage(name, value) {
	return {
		item: 'UserImage',
		name: name,
		value: value
	};
}
