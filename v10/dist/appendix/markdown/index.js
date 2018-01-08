var Tests = {
	headers: '#h1\n##h2\n###h3',
	paragraphs: 'Paragraph One\n\nParagraph Two\n\nParagraph Three',
	linebreaks: 'Line One\nLine Two\nLine Three',
	ordered: '1. One\n2. Two\n3. Three',
	unordered: '* One\n* Two\n* Three',
	link: 'This is a [link](http://www.tradeshift.com)',
	strong: 'This is **strong**',
	em: 'This is *emphasized*',
	strike: 'This is ~~strike~~',
	code: 'This is `code`'
};

ts.ui.ready(function() {
	Array.forEach(document.querySelectorAll('output'), function(output) {
		var markdown = Tests[output.id];
		if (markdown) {
			var exampleMarkup = JSON.stringify(markdown).replace(/['"]+/g, '');
			var exampleCode = '<code>' + exampleMarkup + '</code><br><br>';
			output.innerHTML = exampleCode + ' ' + ts.ui.Markdown.parse(markdown);
		} else {
			console.error('No mapping for "' + output.id + '""');
		}
	});
});
