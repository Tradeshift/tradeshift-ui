describe('ts.ui.DialogSpirit', function likethis() {

	function gethtml() {
		var dialogs = document.querySelectorAll('.ts-dialog');
		return (dialogs[dialogs.length - 1]).outerHTML;
	}

	it('should display confirm information', function(done) {
		var dialog = ts.ui.Dialog.confirm('leo', {});
		sometime(function later() {
			expect(gethtml()).toContain('leo');
			dialog.accept();
			done();
		});
	});

	it('should display ok button', function(done) {
		var dialog = ts.ui.Dialog.confirm('leo', {});
		sometime(function later() {
			expect(gethtml()).toContain('OK');
			dialog.accept();
			done();
		});
	});

	it('should display cancel button', function(done) {
		var dialog = ts.ui.Dialog.confirm('leo', {});
		sometime(function later() {
			expect(gethtml()).toContain('Cancel');
			dialog.accept();
			done();
		});
	});

	it('should display daniel button', function(done) {
		var dialog = ts.ui.Dialog.confirm('leo', 'daniel', {});
		sometime(function later() {
			expect(gethtml()).toContain('daniel');
			expect(gethtml()).not.toContain('OK');
			dialog.accept();
			done();
		});
	});

	it('should display primary button', function(done) {
		var dialog = ts.ui.Dialog.confirm('leo', {primary: 'accept', focused: 'accept'});
		sometime(function later() {
			expect(gethtml()).toContain('ts-primary');
			// expect(gethtml()).toContain('ts-focused'); // flaky
			dialog.accept();
			done();
		});
	});

	/*
	 * Should work, why not?
	 *
	it('should contain ts-dialog-warning', function(done) {
		var dialog = ts.ui.Dialog.warning('leo', {});
		sometime(function later() {
			expect(gethtml()).toContain('ts-dialog-warning');
			done();
		});
	});

	it('should contain ts-dialog-danger', function(done) {
		var dialog = ts.ui.Dialog.danger('leo', {});
		sometime(function later() {
			expect(gethtml()).toContain('ts-dialog-danger');
			done();
		});
	});
	*/

});
