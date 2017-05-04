/**
 * TODO: Test DOM exceptions
 * TODO: Support and test DOM4 methods
 */
describe('Regular DOM mutations (without spirits)', function likethis() {
	// Preparations ..............................................................

	var main = document.body.appendChild(getelm('main'));

	function getelm(name) {
		return document.createElement(name);
	}

	function elmcount(n) {
		return main.childElementCount === n;
	}

	function firstelm(name) {
		return main.firstElementChild.localName === name;
	}

	// Expectations ..............................................................

	it('should appendChild', function() {
		main.appendChild(getelm('div'));
		expect(elmcount(1)).toBe(true);
	});

	it('should insertBefore', function() {
		main.insertBefore(getelm('span'), main.firstElementChild);
		expect(elmcount(2) && firstelm('span')).toBe(true);
	});

	it('should removeChild', function() {
		main.removeChild(main.firstElementChild);
		expect(elmcount(1) && firstelm('div')).toBe(true);
	});

	it('should replaceChild', function() {
		main.replaceChild(getelm('strong'), main.firstElementChild);
		expect(elmcount(1) && firstelm('strong')).toBe(true);
	});

	it('should setAttribute', function() {
		var first = main.firstElementChild;
		first.setAttribute('test', 'working');
		expect(first.getAttribute('test')).toBe('working');
	});

	it('should removeAttribute', function() {
		var first = main.firstElementChild;
		first.removeAttribute('test');
		expect(first.hasAttribute('test')).toBe(false);
	});

	it('should innerHTML', function() {
		main.innerHTML = '<em>innerHTML</em>';
		expect(firstelm('em')).toBe(true);
	});

	it('should textContent', function() {
		main.textContent = 'textContent';
		expect(main.firstChild.data).toBe('textContent');
	});
});
