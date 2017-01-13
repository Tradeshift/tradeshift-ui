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

		sometime(function later() {
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
