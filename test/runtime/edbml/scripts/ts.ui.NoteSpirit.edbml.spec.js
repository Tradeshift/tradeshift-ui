describe('ts.ui.NoteSpirit.edbml', function likethis() {
	function gethtml(model) {
		var spirit = ts.ui.NoteSpirit.summon(model);
		var dom = helper.createTestDom();
		dom.appendChild(spirit.element);
		return dom.innerHTML;
	}

	it('should contian icon', function(done) {
		var model = new ts.ui.NoteModel({
			icon: 'ts-icon-leo'
		});
		sometime(function later() {
			expect(gethtml(model)).toContain('ts-icon-leo');
			done();
		});
	});

	it('should contian text', function(done) {
		var model = new ts.ui.NoteModel({
			text: 'daniel'
		});
		sometime(function later() {
			expect(gethtml(model)).toContain('daniel');
			done();
		});
	});

	it('should contian close button', function(done) {
		var model = new ts.ui.NoteModel({
			onclose: function() {}
		});
		sometime(function later() {
			expect(gethtml(model)).toContain('<button class="ts-note-close"');
			expect(gethtml(model)).toContain('<i class="ts-icon-close"></i>');
			done();
		});
	});
});
