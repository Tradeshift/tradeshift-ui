describe('ts.ui.ToolBarSpirit.edbml', function likethis() {
	function getspirit(html, id) {
		var dom = helper.createTestDom();
		dom.innerHTML = html;
		var spirit = ts.ui.get(dom.querySelector('#' + id));
		return spirit;
	}

	it('should render title', function(done) {
		var html = '<footer data-ts="ToolBar" id="mytoolbar1"></footer>';
		var spirit = getspirit(html, 'mytoolbar1');
		spirit.title('leo');
		sometime(function later() {
			expect(spirit.element.innerHTML).toContain('ts-toolbar-title');
			expect(spirit.element.innerHTML).toContain('leo');
			done();
		});
	});

	it('should render search', function(done) {
		var html = '<footer data-ts="ToolBar" id="mytoolbar2"></footer>';
		var spirit = getspirit(html, 'mytoolbar2');
		spirit.search({});
		sometime(function later() {
			expect(spirit.element.innerHTML).toContain('ts-toolbar-search');
			done();
		});
	});

	it('should render button', function(done) {
		var html = '<footer data-ts="ToolBar" id="mytoolbar3"></footer>';
		var spirit = getspirit(html, 'mytoolbar3');
		spirit.buttons([{
			label: 'Daniel',
			type: 'ts-primary'
		}]);
		sometime(function later() {
			expect(spirit.element.innerHTML).toContain('ts-primary');
			expect(spirit.element.innerHTML).toContain('Daniel');
			done();
		});
	});

	it('should render ts-toolbar-menu', function(done) {
		var html = '<footer data-ts="ToolBar" id="mytoolbar4"></footer>';
		var spirit = getspirit(html, 'mytoolbar4');
		spirit.title('moth');
		sometime(function later() {
			expect(spirit.element.innerHTML).toContain('ts-toolbar-menu');
			done();
		});
	});
});
