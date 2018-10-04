describe('ts.ui.svgname.edbml', function likethis() {
	function gethtml(text, col1, col2, size, stylesheetUrl, stylesheetTxt) {
		return ts.ui.svgname.edbml(text, col1, col2, size, stylesheetUrl, stylesheetTxt);
	}

	it('should contain svg', function() {
		expect(gethtml()).toContain('<svg xmlns="http://www.w3.org/2000/svg"');
	});

	it('should contain text', function() {
		expect(gethtml()).toContain('<text x="50%"');
	});

	it('should contain col1, width and height', function() {
		expect(gethtml('test', 'red', 'green', 22)).toContain(
			'width="22px" height="22px" viewBox="0 0 22 22" style="background-color:red;"'
		);
	});

	it('should contain defs', function() {
		expect(gethtml('test', 'red', 'green', 22, 'stylesheet_url')).toContain('<defs>');
	});

	it('should contain style sheet', function() {
		expect(gethtml('test', 'red', 'green', 22, 'stylesheet_url')).toContain(
			'<style type="text/css">'
		);
	});

	it('should contain style sheet contents', function() {
		var html = gethtml('test', 'red', 'green', 22, 'stylesheet_url');
		expect(html).toContain('text-anchor="middle"');
		expect(html).toContain('alignment-baseline="middle"');
		expect(html).toContain('font-size="8.46');
		expect(html).toContain('font-family="Open Sans"');
		expect(html).toContain('font-weight="400"');
		expect(html).toContain('fill="green"');
		expect(html).toContain('test');
		expect(html).toContain('</text>');
	});
});
