var initTopBar = function() {
	ts.ui.TopBar.tabs([
		{label: "Components"},
		{label: "Icon Tab", icon: "ts-icon-todo"},
		{label: "Counter Tab", counter: 8},
		{label: "Closeable Tab", closeable: true}
	]);
	ts.ui.TopBar.buttons([
		{label : "Primary", type : "ts-primary"}
	]);
	ts.ui.TopBar.tabs().showNew();
};

var initTabBar = function() {
	ts.ui.TabBar.tabs([
		{label: 'Second Level'},
		{label: 'Icon TabBar', icon: "ts-icon-todo"},
		{label: 'Counter TabBar', counter: 1}
	]);
};

var initToolBar = function() {
	ts.ui.ToolBar.search();
	ts.ui.ToolBar.buttons([
		{label : "Primary", type : "ts-primary"},
		{label : "Secondary", type : "ts-secondary"},
		{label : "Tertiary One"},
		{label : "Tertiary Two"}	
	]);
};

var initTable = function() {
	var table = ts.ui.get('#myTable');
		table.selectable();
		table.cols(['One', 'Two', 'Three']);
		table.rows([
			{cells: ['A', 'D', 'G']},
			{cells: ['B', 'E', 'H']},
			{cells: ['C', 'F', 'I']},
		]);
};

var openAside = function() {
	var aside = ts.ui.get('#myaside');
	aside.open();
};

$(document).ready(function() {
    initTopBar();
    initTabBar();
    initToolBar();
    initTable();
    // openAside();
});
