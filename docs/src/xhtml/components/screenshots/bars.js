function initTopBar() {
	ts.ui.TopBar.tabs().showNew();
	ts.ui.TopBar.tabs([
		{label: 'Components'},
		{label: 'Icon Tab', icon: 'ts-icon-todo'},
		{label: 'Counter Tab', counter: 8},
		{label: 'Closeable Tab', closeable: true}
	]).buttons([
		{label: 'Primary', type: 'ts-primary'},
		{label: 'Secondary', type: 'ts-secondary'},
		{label: 'Tertiary'}
	]);
}

function initTabBar() {
	ts.ui.TabBar.tabs().showNew();
	ts.ui.TabBar.tabs([
		{label: 'Second Level'},
		{label: 'Icon TabBar', icon: 'ts-icon-todo'},
		{label: 'Counter TabBar', counter: 1}
	]);
}

function initToolBar() {
	ts.ui.ToolBar.title('Main ToolBar').search({}).buttons([
		{label: 'Primary', type: 'ts-primary'},
		{label: 'Secondary', type: 'ts-secondary'},
		{label: 'Tertiary One'},
		{label: 'Tertiary Two'}
	]);
}

function initStatusBar() {
	ts.ui.StatusBar.message('Status message').pager({
		pages: 23,
		page: 0
	}).buttons([
		{
			icon: 'ts-icon-todo'
		}
	]);
};

ts.ui.ready(function() {

	// main bars
	initTopBar();
	initTabBar();
	initToolBar();
	initStatusBar();

	// inline bars
	['toolbar', 'tabbar', 'statusbar'].forEach(function(id) {
		ts.ui.get(id).buttons([
			{label: 'Primary', type: 'ts-primary'},
			{label: 'Secondary', type: 'ts-secondary'},
			{label: 'Tertiary One'},
			{label: 'Tertiary Two'}
		]);
	});

	ts.ui.get('tabbar').tabs([
		{label: 'One'},
		{label: 'Two'},
		{label: 'Three'}
	]);
	
});
