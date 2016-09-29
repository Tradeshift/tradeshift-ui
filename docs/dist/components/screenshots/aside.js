var openAside = function() {
	var aside = ts.ui.get('#myaside');
	aside.open();
};
ts.ui.ready(function() {
    openAside();
});
