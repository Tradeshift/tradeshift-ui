/**
 * Fetch and render company cards.
 */
$.getJSON('assets/cards.json', function(json) {
	ts.ui.CompanyCard.render(json);
});
