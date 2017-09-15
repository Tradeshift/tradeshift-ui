describe('ts.ui.svgicons.edbml', function likethis() {
	function gethtml(icon, size) {
		return ts.ui.svgicons.edbml(icon, size);
	}

	it('should contain svg', function() {
		expect(gethtml('icon', 22)).toContain('<svg class="ts-svg-icon"');
	});

	it('should contain width and height', function() {
		expect(gethtml('icon', 22)).toContain('width="22" height="22"');
	});

	it('icon is fast-forward', function() {
		expect(gethtml('fast-forward', 22)).toContain(
			'<path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/>'
		);
	});

	it('icon is fast-rewind', function() {
		expect(gethtml('fast-rewind', 22)).toContain(
			'<path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/>'
		);
	});

	it('icon is skip-next', function() {
		expect(gethtml('skip-next', 22)).toContain('<path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>');
	});

	it('icon is skip-previous', function() {
		expect(gethtml('skip-previous', 22)).toContain('<path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>');
	});
});
