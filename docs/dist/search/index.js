var lunrindex, $results, pagesindex;

/**
 * Trigger a search in lunr and transform the result
 * @param	{String} query
 * @return {Array}	results
 */
// Initialize lunrjs
function initlunr() {
	$.getJSON('/dist/lunr.json')
		.done(function(index) {
			pagesindex = index;
			lunrindex = lunr(function() {
				this.field('title', {
					boost: 10
				});
				this.field('tags', {
					boost: 5
				});
				this.field('content');

				// ref is the result item identifier (I chose the page URL)
				this.ref('href');
			});
			pagesindex.forEach(function(page) {
				if (page) {
					lunrindex.add(page);
				}
			});
			$('input#search').on('keyup', function() {
				var query = $(this).val();
				lunrindex.search(query);
			});
		})
		.fail(function(jqxhr, textStatus, error) {
			var err = textStatus + ', ' + error;
			console.error('Error getting index flie:', err);
		});
}

/**
 * Trigger a search in lunr and transform the result
 */
function initui() {
	$results = $('#results');
	var searchbar = ts.ui.get('#searchbar');
	searchbar.search({
		onsearch: function(query) {
			$results.empty();
			if (query.length < 2) {
				return;
			}
			var results = search(query);
			renderResults(query, results);
		},
		flex: 1
	});
	searchbar.search().focus();
}

/**
 * Trigger a search in lunr and transform the result
 * @param	{String} query
 * @return {Array} results
 */
function search(query) {
	return lunrindex.search(query).map(function(result) {
		return pagesindex.filter(function(page) {
			return page && page.href === result.ref;
		})[0];
	});
}

/**
 * Display results
 * @param	{String} query string
 * @param	{Array} results to display
 */
function renderResults(query, results) {
	if (!results.length) {
		$results.append(
			$('<p class="content">').html('No results found for <code>' + query + '</code>')
		);
		return;
	}

	// Only show the ten first results
	results.forEach(function(result) {
		var $result = $('<li>');
		$result.append(
			$('<a>', {
				'data-ts': 'Button',
				href: '/#' + result.href,
				text: result.title
			})
		);
		$result.append($('<p class="content">').html(getContent(query, result.content.split(' '))));
		$results.append($result);
	});
}

/**
 * get slice string
 * @param	{String} query string
 * @param	{Array} content array
 * @return {String}	results
 */
function getContent(query, content) {
	var queryIndex = content.indexOf(query);
	var start = queryIndex - 10 > 0 ? queryIndex - 10 : 0;
	var end = queryIndex + 10 > content.length - 1 ? content.length - 1 : queryIndex + 10;
	return (
		content
			.slice(start, end)
			.join(' ')
			.replace(query, '<code>' + query + '</code>') + '...'
	);
}

// Let's get started
initlunr();

$(document).ready(function() {
	initui();
});
