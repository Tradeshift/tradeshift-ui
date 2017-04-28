var initTable = function() {
	var table = ts.ui.get('#myTable');
	table.selectable();
	table.cols(['One', 'Two', 'Three']);
	table.rows([
		{ cells: ['A', 'B', 'C'], selected: true },
		{ cells: ['D', 'E', 'F'], selectable: false },
		{ cells: ['G', 'H', 'I'] },
		{ cells: ['J', 'K', 'L'] },
		{
			cells: [
				{
					item: 'Switch',
					name: 'John',
					value: 23,
					checked: true
				},
				{
					item: 'Button',
					type: 'ts-secondary ts-micro',
					label: 'Button',
					name: 'my-button',
					value: 23
				},
				{
					item: 'Icon',
					type: 'ts-icon-todo',
					color: 'purple'
				}
			]
		}
	]);
	table.status('This is the message.');
	table.configurable().pager({
		pages: 23
	});
};

ts.ui.ready(function() {
	initTable();
});
