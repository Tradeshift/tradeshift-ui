describe('ts.ui.TimeSpirit', function likethis() {
	function setup(action, html) {
		var spirit,
			dom = helper.createTestDom();
		dom.innerHTML = html;
		sometime(function later() {
			spirit = ts.ui.get(dom.querySelector('time'));
			spirit.dom.remove();
			action(spirit);
		});
	}

	it('should (eventually) channel via ts-attribute', function(done) {
		var html = '<time data-ts="Time" datetime="2015-11-04 03:59:33"></time>';
		setup(function(spirit) {
			expect(ts.ui.TimeSpirit.is(spirit)).toBe(true);
			done();
		}, html);
	});

	it('should localize the time', function(done) {
		var tests = {
			da: '2 år siden',
			'de-CH': 'vor 2 Jahren',
			de: 'vor 2 Jahren',
			'en-GB': '2 years ago',
			'en-US': '2 years ago',
			en: '2 years ago',
			es: 'hace 2 años',
			fr: 'il y a 2 ans',
			hu: '2 éve',
			id: '2 tahun yang lalu',
			it: '2 anni fa',
			ja: '2年前',
			ms: '2 tahun yang lepas',
			'nb-NO': '2 år siden',
			nl: '2 jaar geleden',
			no: '2 år siden',
			pl: '2 lata temu',
			'pt-BR': '2 anos atrás',
			'pt-PT': 'há 2 anos',
			ro: '2 ani în urmă',
			ru: '2 года назад',
			se: 'maŋit 2 jagit',
			'sv-SE': 'för 2 år sedan',
			'zh-CN': '2 年前',
			'zh-TW': '2 年前'
		};
		var codes = Object.keys(tests);
		codes.forEach(function(code, i) {
			setup(function(spirit) {
				var html = spirit.element.innerHTML.replace(/\d/g, '');
				var text = tests[code].replace(/\d/g, '');
				expect(html).toContain(text);
				if (i === codes.length - 1) {
					done();
				}
			}, '<time data-ts="Time" lang="' + code + '" datetime="2015-11-04 03:59:33"></time>');
		});
	});
});
