describe('ts.ui.DialogSpirit', function likethis() {
	function gethtml() {
		var dialogs = document.querySelectorAll('.ts-dialog');
		var first = dialogs[dialogs.length - 1];
		return first.outerHTML;
	}

	it('should display confirm information', function(done) {
		var dialog = ts.ui.Dialog.confirm('Leo?', {});
		sometime(function later() {
			expect(gethtml()).toContain('Leo?');
			dialog.accept().then(done);
		});
	});

	it('should display ok button', function(done) {
		var dialog = ts.ui.Dialog.confirm('OK button?', {});
		sometime(function later() {
			expect(gethtml()).toContain('OK');
			dialog.accept().then(done);
		});
	});

	it('should display cancel button', function(done) {
		var dialog = ts.ui.Dialog.confirm('Cancel button?', {});
		sometime(function later() {
			expect(gethtml()).toContain('Cancel');
			dialog.accept().then(done);
		});
	});

	it('should display daniel button', function(done) {
		var dialog = ts.ui.Dialog.confirm('Daniel?', 'daniel', {});
		sometime(function later() {
			expect(gethtml()).toContain('daniel');
			expect(gethtml()).not.toContain('OK');
			dialog.accept().then(done);
		});
	});

	it('should display primary button', function(done) {
		var dialog = ts.ui.Dialog.confirm('Primary?', {
			primary: 'accept',
			focused: 'accept'
		});
		sometime(function later() {
			expect(gethtml()).toContain('ts-primary');
			dialog.accept().then(done);
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
