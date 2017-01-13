/**
 * Testing the stuff.
 */
describe('Attribute Updates', function likethis() {
	it('should add classnames non-destructively', function(done) {
		var spirit = gui.Spirit.summon();
		spirit.script.load(tst.test4.edbml);
		spirit.script.run(null);
		spirit.dom.appendTo(document.body);
		setTimeout(function awkwardwait() {
			var h1 = spirit.dom.q('#testh1');
			h1.classList.add('external-class');
			spirit.script.run('internal-class');
			expect(h1.className).toContain('internal-class');
			expect(h1.className).toContain('external-class');
			done();
		});
	});

	it('should remove classnames non-destructively', function(done) {
		var spirit = gui.Spirit.summon();
		spirit.script.load(tst.test4.edbml);
		spirit.script.run('internal class');
		spirit.dom.appendTo(document.body);
		setTimeout(function awkwardwait() {
			var h1 = spirit.dom.q('#testh1');
			h1.classList.add('external-class');
			spirit.script.run(null);
			expect(h1.className).toContain('external-class');
			expect(h1.className).not.toContain('internal-class');
			done();
		});
	});

	it('should update classnames non-destructively', function(done) {
		var spirit = gui.Spirit.summon();
		spirit.script.load(tst.test4.edbml);
		spirit.script.run('internal-class-before');
		spirit.dom.appendTo(document.body);
		setTimeout(function awkwardwait() { // should not be needed?
			// adding a classname outside of EDBML...
			var h1 = spirit.dom.q('#testh1');
			h1.classList.add('external-class');
			// ... the EDBML should not delete it....
			spirit.script.run('internal-class-after');
			expect(h1.className).toContain('external-class');
			expect(h1.className).toContain('internal-class-after');
			expect(h1.className).not.toContain('internal-class-before');
			done();
		});
	});
});
