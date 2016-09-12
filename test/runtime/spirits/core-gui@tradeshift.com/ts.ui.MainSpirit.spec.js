describe('ts.ui.MainSpirit', function likethis() {
	function setup(action, html, done) {
		var spirit, dom = helper.createTestDom();
		dom.innerHTML = html;
		sometime(function later(){
			spirit = ts.ui.get(dom.querySelector('main'));
			action(spirit, dom);
			done();
		});
	}

	it('should show a spinner via DOM attribute', function(done) {
		var html = '<main data-ts="Main"></main>';
		setup(function(spirit, dom) {
			spirit.element.setAttribute('ts.busy', 'Moth');
			sometime(function later() {
				expect(dom.querySelector('.ts-spinner-text').innerHTML).toContain('Moth');
				expect(dom.querySelector('body')).toContain('ts-spinner-text');
				done();
			});
		}, html, done);
	});

	it('should show a blocking spinner via DOM attribute', function(done) {
		var html = '<main data-ts="Main"></main>';
		setup(function(spirit, dom) {
			spirit.element.setAttribute('data-ts.blocking', 'Moth');
			sometime(function later() {
				expect(dom.querySelector('.ts-spinner-text').innerHTML).toContain('Moth');
				expect(dom.querySelector('body')).toContain('ts-spinner-cover');
				done();
			});
		}, html, done);
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
