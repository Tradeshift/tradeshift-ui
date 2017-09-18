describe('ts.ui.MainSpirit', function likethis() {
	function setup(action, html) {
		var spirit,
			dom = helper.createTestDom();
		dom.innerHTML = html;
		sometime(function later() {
			spirit = ts.ui.get(dom.querySelector('main'));
			action(spirit, dom);
		});
	}

	it('should show a spinner via DOM attribute', function(done) {
		var html = '<main data-ts="Main"></main>';
		setup(function(spirit, dom) {
			spirit.element.setAttribute('data-ts.busy', 'Moth is busy');
			sometime(function later() {
				expect(document.querySelector('.ts-spinner-text').innerHTML).toContain('Moth is busy');
				spirit.element.removeAttribute('data-ts.busy');
				done();
			});
		}, html);
	});

	it('should show a blocking spinner via DOM attribute', function(done) {
		var html = '<main data-ts="Main"></main>';
		setup(function(spirit, dom) {
			spirit.element.setAttribute('data-ts.blocking', 'Moth is blocking, as usual');
			sometime(function later() {
				expect(document.querySelector('.ts-spinner-text').innerHTML).toContain('Moth is blocking');
				spirit.element.removeAttribute('data-ts.blocking');
				done();
			});
		}, html);
	});

	// NOTE: this test may be subject to random failure
	// it('should show a tabbar', function(done) {
	// 	var html = '<main ts-main>'+
	// 					'<div ts-main-content>'+
	// 						'<div ts-panel="" ts.label="leo">'+
	// 							'<p>main content.</p>'+
	// 						'</div>'+
	// 						'<div ts-panel="" ts.label="daniel">'+
	// 							'<p>main content.</p>'+
	// 						'</div>'+
	// 					'</div>'+
	// 				'</main>';
	// 	setup(function(spirit, dom) {
	// 		sometime(function later() {
	// 			expect(dom.querySelector('.ts-tabbar').innerHTML).toContain('leo');
	// 			expect(dom.querySelector('.ts-tabbar').innerHTML).toContain('daniel');
	// 			expect(dom.querySelector('.ts-tabbar').innerHTML).toContain('ts-toolbar-menu');
	// 			done();
	// 		});
	// 	}, html, done);
	// });
});
