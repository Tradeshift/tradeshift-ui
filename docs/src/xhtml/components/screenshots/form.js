var initTable = function() {
	var table = ts.ui.get('#myTable');
	table.selectable();
	table.cols(['One', 'Two', 'Three']);
	table.rows([
		{cells: ['A', 'D', 'G'], selected: true},
		{cells: ['B', 'E', 'H'], selectable: false},
		{cells: ['C', 'F', 'I']},
		{cells: ['H', 'J', 'K']},
	]);
	table.status('This is the message.');
	table.configurable().pager({
		pages: 23
	});
	
};

$(document).ready(function() {
    initTable();
});
