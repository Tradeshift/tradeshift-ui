describe('ts.ui.usercard.edbml', function likethis() {
	function gethtml(user, contentonly, classconfig) {
		return ts.ui.usercard.edbml(user, contentonly, classconfig);
	}

	it('should contain ts-usercard-main', function() {
		var user = new ts.ui.UserCardModel({ id: 'leo' }),
			contentonly = true,
			classconfig = '';
		expect(gethtml(user, contentonly, classconfig)).toContain('ts-usercard-main');
	});

	it('should contain ts-usercard-name in front of ts-usercard-image', function() {
		var user = new ts.ui.UserCardModel({ id: 'leo' }),
			contentonly = true,
			classconfig = 'ts-compact ts-reverse';
		expect(gethtml(user, contentonly, classconfig)).toContain(
			'<p class="ts-usercard-name"><span></span></p><p class="ts-usercard-image">'
		);
	});

	it('should contain ts-usercard-image in front of ts-usercard-name', function() {
		var user = new ts.ui.UserCardModel({ id: 'leo' }),
			contentonly = true,
			classconfig = '';
		var markup = gethtml(user, contentonly, classconfig);
		var index1 = markup.indexOf('ts-usercard-image');
		var index2 = markup.indexOf('ts-usercard-name');
		expect(index1).toBeGreaterThan(0);
		expect(index2).toBeGreaterThan(0);
		expect(index1).toBeLessThan(index2);
	});

	it('should contain ts-usercard-details', function() {
		var user = new ts.ui.UserCardModel({ id: 'leo' }),
			contentonly = true,
			classconfig = 'ts-details';
		expect(gethtml(user, contentonly, classconfig)).toContain('ts-usercard-details');
	});

	it('should not contain ts-usercard-details', function() {
		var user = new ts.ui.UserCardModel({ id: 'leo' }),
			contentonly = true,
			classconfig = '';
		expect(gethtml(user, contentonly, classconfig)).not.toContain('ts-usercard-details');
	});

	it('should contain details', function() {
		var user = new ts.ui.UserCardModel({
				id: 'leo',
				data: {
					title: 'leo',
					role: 'developer',
					company: 'tradeshift',
					email: 'lza@tradeshift.com'
				}
			}),
			contentonly = true,
			classconfig = 'ts-details';
		expect(gethtml(user, contentonly, classconfig)).toContain(
			'<li class="ts-usercard-title">leo</li>'
		);
		expect(gethtml(user, contentonly, classconfig)).toContain(
			'<li class="ts-usercard-role">developer</li>'
		);
		expect(gethtml(user, contentonly, classconfig)).toContain('<li class="ts-usercard-company">');
		expect(gethtml(user, contentonly, classconfig)).toContain('<li class="ts-usercard-email">');
	});
});
