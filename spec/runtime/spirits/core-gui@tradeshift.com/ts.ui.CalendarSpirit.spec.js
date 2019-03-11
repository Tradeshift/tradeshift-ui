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
				this.monthData = ts.ui.__generateDays('2014', '8', '2014', '8', '1', true);
			});

			it('has the first day selected', function() {
				var firstDay = this.monthData[0][0];
				expect(firstDay.day).toBe(1);
				expect(firstDay.month).toBe(8);
				expect(firstDay.year).toBe(2014);
				expect(firstDay.selected).toBe(true);
			});
		});
	});
});
