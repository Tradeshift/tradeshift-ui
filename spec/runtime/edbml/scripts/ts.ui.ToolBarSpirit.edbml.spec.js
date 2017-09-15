describe('ts.ui.ToolBarSpirit.edbml', function likethis() {
	function getspirit() {
		var then = new gui.Then(),
			dom = helper.createTestDom();
		dom.innerHTML = '<footer data-ts="ToolBar"></footer>';
		sometime(function later() {
			var footer = dom.querySelector('footer');
			then.now(ts.ui.get(footer));
		});
		return then;
	}

	it('should render title', function(done) {
		getspirit().then(function(spirit) {
			spirit.title('leo');
			sometime(function later() {
				expect(spirit.element.innerHTML).toContain('ts-toolbar-title');
				expect(spirit.element.innerHTML).toContain('leo');
				done();
			});
		});
	});

	it('should render search', function(done) {
		getspirit().then(function(spirit) {
			spirit.search({});
			sometime(function later() {
				expect(spirit.element.innerHTML).toContain('ts-toolbar-search');
				done();
			});
		});
	});

	it('should render button', function(done) {
		getspirit().then(function(spirit) {
			spirit.buttons([
				{
					label: 'Daniel',
					type: 'ts-primary'
				}
			]);
			sometime(function later() {
				expect(spirit.element.innerHTML).toContain('ts-primary');
				expect(spirit.element.innerHTML).toContain('Daniel');
				done();
			});
		});
	});

	it('should render ts-toolbar-menu', function(done) {
		getspirit().then(function(spirit) {
			spirit.title('moth');
			sometime(function later() {
				expect(spirit.element.innerHTML).toContain('ts-toolbar-menu');
				done();
			});
		});
	});
});
