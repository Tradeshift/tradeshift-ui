describe('ts.ui.ToolBarSpirit', function likethis() {
	// Preparations ..............................................................

	function setup(action) {
		var spirit,
			dom = helper.createTestDom();
		dom.innerHTML = '<header data-ts="ToolBar"></header>';
		sometime(function later() {
			spirit = ts.ui.get(dom.querySelector('header[data-ts=ToolBar]'));
			action(spirit);
		});
	}

	function getsearchinput(spirit) {
		return spirit.element.querySelector('.ts-toolbar-search input');
	}

	function getbuttonsitem(spirit) {
		return spirit.element.querySelector('.ts-toolbar-menu.ts-right');
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
				sometime(function later_() {
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
			spirit.buttons([[{ label: 'Hest' }, { label: 'Fest' }]]);
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

	var isExplorer = (
		navigator.userAgent.indexOf('MSIE') !== -1 ||
		navigator.appVersion.indexOf('Trident/') > 0
	);

	function getsearchlabel(spirit) {
		return spirit.element.querySelector('.ts-toolbar-search label');
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
