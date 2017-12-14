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

	it('should contain value', function(done) {
		var calendar = new ts.ui.DatePickerModel({
			value: '1973-03-26'
		});
		sometime(function later() {
			expect(gethtml(calendar)).toContain('1973');
			expect(gethtml(calendar)).toContain('3');
			expect(gethtml(calendar)).toContain('26');
			done();
		});
	});

	it('should be in Chinese', function(done) {
		var calendar = new ts.ui.DatePickerModel({
			value: '1973-03-26'
		});
		sometime(function later() {
			var html = gethtml(calendar);
			expect(
				'一二三四五六日'.split('').every(function(x) {
					return html.includes(x);
				})
			).toBe(true);
			done();
		});
	});
});
