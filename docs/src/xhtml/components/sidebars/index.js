var sidebars = ['#before-app', '#after-app', '#before-content', '#after-content'];

/**
 * Show sidebar (called from inline HTML). The SideBar doesn't support `open`
 * and `close` just yet (https://github.com/Tradeshift/tradeshift-ui/issues/371)
 * so we'll have to add and remove these SideBars from the DOM :/
 * @param {string} id
 */
window.showsidebar = function show(id) {
	show.current = id;
	var bar;
	sidebars.forEach(function(id) {
		if ((bar = ts.ui.get(id))) {
			bar.dom.remove();
		}
	});
	bar = clone(id);
	switch (id) {
		case '#before-app':
			$('body').prepend(bar);
			break;
		case '#after-app':
			$('body').append(bar);
			break;
		case '#before-content':
			$('.ts-main').prepend(bar);
			break;
		case '#after-content':
		case '#after-content-with-tabs':
			$('.ts-main').append(bar);
			break;
	}
	if (checked()) {
		if (id !== '#before-content' && id !== '#after-content') {
			checked().checked = false;
		}
	}
};

window.togglesidebar = function() {
	ts.ui.get(window.showsidebar.current, sidebar => {
		if (sidebar.isOpen) {
			sidebar.close();
		} else {
			sidebar.open();
		}
	});
};

/**
 * Clone template. No template for IE.
 * @param {string} id
 * @returns {DocumentFragment}
 */
function clone(id) {
	return document.querySelector(id + '-template').content.cloneNode(true);
}

/**
 * Get the checked radio button.
 */
function checked() {
	return document.querySelector('input[type=radio]:checked');
}

/**
 * Firefox will persist the form selection on refresh, so we'll account for that.
 */
ts.ui.ready(function initform() {
	checked().onchange();
});
