/**
 * Testing the stuff.
 */
describe('Mock test', function likethis() {
	it('should render when inserted', function(done) {
		var spirit = gui.Spirit.summon();
		spirit.script.load(tst.test1.edbml);
		spirit.dom.appendTo(document.body);
		setTimeout(function() {
			expect(document.body.innerHTML).toContain('OK');
			done();
		}, 100);
	});

	it('should render when run with an argument', function(done) {
		var spirit = gui.Spirit.summon();
		spirit.script.load(tst.test2.edbml);
		spirit.dom.appendTo(document.body);
		spirit.script.run('OK');
		setTimeout(function() {
			expect(document.body.innerHTML).toContain('OK');
			done();
		}, 100);
	});

	it('should render when output is available', function(done) {
		var spirit = gui.Spirit.summon();
		spirit.script.load(tst.test3.edbml);
		spirit.dom.appendTo(document.body);
		var model = new tst.ModelOne({
			text: 'OK'
		}).output();
		setTimeout(function() {
			expect(document.body.innerHTML).toContain('OK');
			model.revoke();
			done();
		}, 100);
	});
});
