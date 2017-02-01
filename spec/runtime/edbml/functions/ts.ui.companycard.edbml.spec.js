describe('ts.ui.companycard.edbml', function likethis() {
	var card = {
		id: '6bf17754-f9de-4e31-aa31-bd3ff765b9c2',
		data: {}
	};

	function gethtml(cardItem, contentonly) {
		return ts.ui.companycard.edbml(new ts.ui.CompanyCardModel(cardItem), contentonly);
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
