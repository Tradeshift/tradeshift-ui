var initTopBar = function() {
	ts.ui.TopBar.tabs([
		{label: "Components"},
		{label: "Icon Tab", icon: "ts-icon-todo"},
		{label: "Counter Tab", counter: 8},
		{label: "Closeable Tab", closeable: true}
	]);
	ts.ui.TopBar.tabs().showNew();
	ts.ui.TopBar.buttons([
		{label : "Primary", type : "ts-primary"}
	]);
};

var initTabBar = function() {
	ts.ui.TabBar.tabs([
		{label: 'Second Level'},
		{label: 'Icon TabBar', icon: "ts-icon-todo"},
		{label: 'Counter TabBar', counter: 1}
	]);
	ts.ui.TabBar.tabs().showNew();
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

var initStatusBar = function() {
	ts.ui.StatusBar.pager({
		pages: 23,
		page: 0
	});
};

$(document).ready(function() {
    initTopBar();
    initTabBar();
    //initToolBar();
    initStatusBar();
});