describe('ts.ui.DialogSpirit', function likethis() {

	it('should display confirm information', function() {
		var spirit = ts.ui.Dialog.confirm('leo', {});
		sometime(function later(){
			expect(spirit.element.innerHTML).toContain('leo');
		});
	});

	it('should display ok button', function() {
		var spirit = ts.ui.Dialog.confirm('leo', {});
		sometime(function later(){
			expect(spirit.element.innerHTML).toContain('ok');
		});
	});

	it('should display cancel button', function() {
		var spirit = ts.ui.Dialog.confirm('leo', {});
		sometime(function later(){
			expect(spirit.element.innerHTML).toContain('cancel');
		});
	});

	it('should display daniel button', function() {
		var spirit = ts.ui.Dialog.confirm('leo', 'daniel', {});
		sometime(function later(){
			expect(spirit.element.innerHTML).toContain('daniel');
			expect(spirit.element.innerHTML).not.toContain('ok');
		});
	});

	it('should display primary button', function() {
		var spirit = ts.ui.Dialog.confirm('leo', {primary: 'accept', focused: 'accept'});
		sometime(function later(){
			expect(spirit.element.innerHTML).toContain('ts-primary');
			expect(spirit.element.innerHTML).toContain('ts-focused');
		});
	});

	it('should contain ts-dialog-warning', function() {
		var spirit = ts.ui.Dialog.warning('leo', {});
		sometime(function later(){
			expect(spirit.element.innerHTML).toContain('ts-dialog-warning');
		});
	});

	it('should contain ts-dialog-danger', function() {
		var spirit = ts.ui.Dialog.danger('leo', {});
		sometime(function later(){
			expect(spirit.element.innerHTML).toContain('ts-dialog-danger');
		});
	});
});
