describe('ts.ui.ModalSpirit', function likethis() {
	var MARKUP = '<div data-ts="Modal"><div data-ts="Panel"></div></div>';

	it('should (eventually) channel via ts-attribute', function(done) {
		var dom = helper.createTestDom();
		dom.innerHTML = MARKUP;
		sometime(function later() {
			var spirit = ts.ui.get(dom.querySelector('[data-ts=Modal]'));
			expect(ts.ui.ModalSpirit.is(spirit)).toBe(true);
			done();
		});
	});

	// Opening a Modal appends a `.ts-modal-cover` to the body and makes it
	// visible (see the spirit's `_addCover`) — its signature overlay behavior.
	it('should show the modal cover when opened', function(done) {
		var dom = helper.createTestDom();
		dom.innerHTML = MARKUP;
		sometime(function later() {
			var spirit = ts.ui.get(dom.querySelector('[data-ts=Modal]'));
			spirit.open();
			sometime(function opened() {
				var cover = document.querySelector('.ts-modal-cover');
				expect(cover).not.toBeNull();
				expect(cover.classList.contains('ts-visible')).toBe(true);
				spirit.close();
				done();
			}, 500);
		});
	});

	it('should render a title in the header', function(done) {
		var dom = helper.createTestDom();
		dom.innerHTML = MARKUP;
		sometime(function later() {
			var spirit = ts.ui.get(dom.querySelector('[data-ts=Modal]'));
			spirit.title('My Modal');
			sometime(function rendered() {
				expect(spirit.element.innerHTML).toContain('My Modal');
				done();
			});
		});
	});

	// Modal buttons go into the footer. The bar collapses button labels into an
	// overflow menu when unsized, so we assert a rendered button element in the
	// footer rather than the label text.
	it('should render a button in the footer', function(done) {
		var dom = helper.createTestDom();
		dom.innerHTML = MARKUP;
		sometime(function later() {
			var spirit = ts.ui.get(dom.querySelector('[data-ts=Modal]'));
			spirit.buttons([{ label: 'Save' }]);
			sometime(function rendered() {
				var footer = spirit.element.querySelector('.ts-footerbar');
				expect(footer).not.toBeNull();
				expect(footer.querySelector('button')).not.toBeNull();
				done();
			});
		});
	});
});
