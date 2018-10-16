describe('ts.ui.CompanyCardSpirit', function likethis() {
	var CARDDATA = {
		id: '6bf17754-f9de-4e31-aa31-bd3ff765b9c2',
		data: {
			name: 'Tradeshift',
			logo: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
			size: '100–249',
			location: 'San Francisco, California',
			industry: 'Software & IT',
			connection: 2
		}
	};

	it('should (eventually) channel via ts-attribute', function(done) {
		var spirit,
			dom = helper.createTestDom();
		dom.innerHTML = '<div data-ts="CompanyCard"></div>';
		sometime(function later() {
			spirit = ts.ui.get(dom.querySelector('div'));
			expect(ts.ui.CompanyCardSpirit.is(spirit)).toBe(true);
			done();
		});
	});

	it('should generate HTML via .render(json)', function(done) {
		var spirit,
			dom = helper.createTestDom();
		dom.innerHTML = '<div data-ts="CompanyCard"></div>';
		sometime(function later() {
			spirit = ts.ui.get(dom.querySelector('div'));
			spirit.render(CARDDATA);
			var html = spirit.element.innerHTML.replace(/&amp;/g, '&');
			Object.keys(CARDDATA.data).forEach(function(key) {
				if (key === 'connection') {
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
		var spirit,
			dom = helper.createTestDom();
		var encodedjson = encodeURIComponent(JSON.stringify(CARDDATA).trim());
		dom.innerHTML = '<div data-ts="CompanyCard" data-ts.render="' + encodedjson + '"></div>';
		sometime(function later() {
			spirit = ts.ui.get(dom.querySelector('div'));
			var html = spirit.element.innerHTML.replace(/&amp;/g, '&');
			Object.keys(CARDDATA.data).forEach(function(key) {
				if (key === 'connection') {
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
