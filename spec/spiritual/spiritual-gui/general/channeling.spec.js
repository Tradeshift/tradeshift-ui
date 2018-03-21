/**
 * Channeling and exorcizing
 */
describe('Channeling and exorcising spirits', function likethis() {
	// Preparations ..............................................................

	// Why so much timeout needed??? It does work with zero, but not always...
	var STRANGELY_BIG_TIMEOUT = 100;

	/**
	 * Before test.
	 */
	beforeEach(function() {
		this.sandbox = document.body.appendChild(document.createElement('div'));
	});

	/**
	 * After test.
	 */
	afterEach(function() {
		this.sandbox.parentNode.removeChild(this.sandbox);
	});

	/**
	 * Get element that will channel a
	 * spirit once inserted into DOM.
	 * @returns {Element}
	 */
	function getSpiritElm() {
		var elm = document.createElement('div');
		elm.className = 'gui-spirit';
		return elm;
	}

	/**
	 * Element has spirit?
	 * @param {Element} elm
	 * @returns {boolean}
	 */
	function hasSpirit(elm) {
		return !!gui.get(elm);
	}

	/**
	 * Dramatic pause for WebKit pending the horrible bug
	 * - on innerHTML, possession runs sync in Firefox and IE
	 * - on innerHTML, possession runs async in Chrome and Safari (for now)
	 * @see https://code.google.com/p/chromium/issues/detail?id=43394
	 */
	function sometime(action) {
		setTimeout(action, STRANGELY_BIG_TIMEOUT);
	}

	// Expectations ..............................................................

	it('should (eventually) possess on innerHTML', function(done) {
		var sandbox = this.sandbox;
		sandbox.innerHTML = '<div class="gui-spirit"></div>';
		sometime(function later() {
			expect(hasSpirit(sandbox.firstChild)).toBe(true);
			done();
		});
	});

	it('should possess the inline spirit (not channeled)', function(done) {
		window.MySpirit = ts.ui.Spirit.extend();
		var sandbox = this.sandbox;
		sandbox.innerHTML = '<div data-ts="MySpirit"></div>';
		sometime(function later() {
			expect(hasSpirit(sandbox.firstChild)).toBe(true);
			done();
		});
	});

	it('should possess on appendChild', function() {
		var elm = getSpiritElm();
		this.sandbox.appendChild(elm);
		expect(hasSpirit(elm)).toBe(true);
	});

	it('should possess on insertBefore', function() {
		var elm = getSpiritElm();
		this.sandbox.insertBefore(elm, this.sandbox.firstElementChild);
		expect(hasSpirit(elm)).toBe(true);
	});

	it('should posses on insertBefore of document fragment', function() {
		var frag = document.createDocumentFragment();
		var spirits = [getSpiritElm(), getSpiritElm()];
		spirits.forEach(function(e) {
			frag.appendChild(e);
		});
		this.sandbox.insertBefore(frag, this.sandbox.firstElementChild);
		spirits.forEach(function(e) {
			expect(hasSpirit(e)).toBe(true);
		});
	});

	// "eventually" because Safari 10 cannot patch the method properly :/
	it('should (eventually) possess on insertAdjacentHTML', function(done) {
		var box = this.sandbox;
		var elm = box.appendChild(document.createElement('section'));
		['beforebegin', 'afterbegin', 'beforeend', 'afterend'].forEach(function(pos) {
			elm.insertAdjacentHTML(pos, '<div class="gui-spirit"></div>');
		});
		expect(box.childNodes.length).toBe(3);
		expect(elm.childNodes.length).toBe(2);
		sometime(function later() {
			[
				elm.previousElementSibling,
				elm.nextElementSibling,
				elm.firstElementChild,
				elm.lastElementChild
			].forEach(function(other) {
				expect(hasSpirit(other)).toBe(true);
			});
			done();
		});
	});

	// "eventually" because Safari 10 cannot patch the method properly :/
	it('should (eventually) possess on insertAdjacentElement', function(done) {
		var box = this.sandbox;
		var elm = box.appendChild(document.createElement('section'));
		['beforebegin', 'afterbegin', 'beforeend', 'afterend'].forEach(function(pos) {
			elm.insertAdjacentElement(pos, getSpiritElm());
		});
		expect(box.childNodes.length).toBe(3);
		expect(elm.childNodes.length).toBe(2);
		sometime(function later() {
			[
				elm.previousElementSibling,
				elm.nextElementSibling,
				elm.firstElementChild,
				elm.lastElementChild
			].forEach(function(other) {
				expect(hasSpirit(other)).toBe(true);
			});
			done();
		});
	});

	describe('replaceChild', function() {
		beforeEach(function() {
			this.newelm = getSpiritElm();
			this.oldelm = getSpiritElm();
			this.sandbox.appendChild(this.oldelm);
			this.sandbox.replaceChild(this.newelm, this.oldelm);
		});
		it('possesses the replacement', function() {
			expect(hasSpirit(this.newelm)).toBe(true);
		});
		it('exorcizes the old element', function(done) {
			var that = this;
			sometime(function later() {
				expect(hasSpirit(that.oldelm)).toBe(false);
				done();
			});
		});
	});

	it('should (eventually) exorcize on removeChild', function(done) {
		var elm = getSpiritElm();
		var box = this.sandbox;
		box.appendChild(elm);
		sometime(function later() {
			expect(hasSpirit(elm)).toBe(true);
			box.removeChild(elm);
			sometime(function muchlater() {
				expect(hasSpirit(elm)).toBe(false);
				done();
			});
		});
	});

	it('should (eventually) exorcize on innerHTML', function(done) {
		var elm = getSpiritElm();
		var box = this.sandbox;
		box.appendChild(elm);
		sometime(function later() {
			expect(hasSpirit(elm)).toBe(true);
			box.innerHTML = '';
			sometime(function muchlater() {
				expect(hasSpirit(elm)).toBe(false);
				done();
			});
		});
	});

	if (!gui.Client.isExplorer9 && !gui.Client.isExplorer10) {
		it('should (eventually) possess on outerHTML', function(done) {
			var sandbox = this.sandbox;
			var container = document.createElement('div');
			var elm = getSpiritElm();
			container.appendChild(elm);
			sandbox.appendChild(container);
			elm.outerHTML = '<div></div>';
			sometime(function later() {
				container.outerHTML = '<div><div class="gui-spirit"></div></div>';
				sometime(function muchlater() {
					expect(hasSpirit(sandbox.firstChild.firstChild)).toBe(true);
					done();
				});
			});
		});

		it('should (eventually) exorcize on outerHTML', function(done) {
			var container = document.createElement('div');
			var elm = getSpiritElm();
			container.appendChild(elm);
			this.sandbox.appendChild(container);
			sometime(function later() {
				expect(hasSpirit(elm)).toBe(true);
				elm.outerHTML = '<div></div>';
				sometime(function muchlater() {
					expect(hasSpirit(elm)).toBe(false);
					done();
				});
			});
		});

		it('should support (an optional) callback in gui.get', function(done) {
			var button = document.createElement('button');
			var counter = 0;
			button.setAttribute('data-ts', 'Button');
			ts.ui.get(button, function(spirit) {
				counter += 1;
			});
			ts.ui.get(button, function(spirit) {
				counter += 1;
			});
			ts.ui.get(button, function(spirit) {
				counter += 1;
			});
			setTimeout(function() {
				document.body.appendChild(button);
				expect(counter).toBe(3);
				document.body.removeChild(button);
				done();
			}, 1000);
		});
	}

	if (!gui.Client.isExplorer) {
		it('should (eventually) exorcize on textContent', function(done) {
			var elm = getSpiritElm();
			var box = this.sandbox;
			box.appendChild(elm);
			sometime(function later() {
				expect(hasSpirit(elm)).toBe(true);
				box.textContent = '';
				sometime(function muchlater() {
					expect(hasSpirit(elm)).toBe(false);
					done();
				});
			});
		});
	}
});
