describe('ts.ui.DialogSpirit.edbml', function likethis() {
	function gethtml(dialog) {
		var spirit = ts.ui.DialogSpirit.summon(dialog);
		var dom = helper.createTestDom();
		dom.appendChild(spirit.element);
		return dom.innerHTML;
	}

	it('should contain icon', function(done) {
		var dialog = new ts.ui.DialogModel({
			icon: 'moth-daniel-leo'
		});
		sometime(function later() {
			expect(gethtml(dialog)).toContain('<div class="ts-dialog-head">');
			expect(gethtml(dialog)).toContain('<i class="ts-dialog-icon moth-daniel-leo"></i>');
			done();
		});
	});

	it('should not contain icon', function(done) {
		var dialog = new ts.ui.DialogModel({});
		sometime(function later() {
			expect(gethtml(dialog)).not.toContain('<div class="ts-dialog-head">');
			done();
		});
	});

	it('should render item', function(done) {
		var dialog = new ts.ui.DialogModel({
			items: [
				{
					item: 'text',
					text: 'daniel'
				}
			]
		});
		sometime(function later() {
			expect(gethtml(dialog)).toContain('<div class="ts-dialog-body">');
			expect(gethtml(dialog)).toContain('daniel');
			done();
		});
	});

	it('should not render item', function(done) {
		var dialog = new ts.ui.DialogModel({});
		sometime(function later() {
			expect(gethtml(dialog)).not.toContain('<div class="ts-dialog-body">');
			done();
		});
	});

	it('should render item', function(done) {
		var dialog = new ts.ui.DialogModel({
			buttons: [
				{
					label: 'moth'
				}
			]
		});
		sometime(function later() {
			expect(gethtml(dialog)).toContain('<div class="ts-dialog-buttons">');
			expect(gethtml(dialog)).toContain('ts-buttons');
			expect(gethtml(dialog)).toContain('moth');
			done();
		});
	});

	it('should not render buttons', function(done) {
		var dialog = new ts.ui.DialogModel({});
		sometime(function later() {
			expect(gethtml(dialog)).not.toContain('<div class="ts-dialog-buttons">');
			done();
		});
	});
});
