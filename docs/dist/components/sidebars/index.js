var sidebars = ['#before-app', '#after-app', '#before-content', '#after-content'];

/**
 * Show sidebar (called from inline HTML). The SideBar doesn't support `open` 
 * and `close` just yet (https://github.com/Tradeshift/tradeshift-ui/issues/371) 
 * so we'll have to add and remove these SideBars from the DOM :/
 * @param {string} id
 */
window.show = function(id) {
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
			$('.ts-main').append(bar);
			break;
	}
};

/**
 * Clone template. No template for IE.
 * @param {string} id
 * @returns {DocumentFragment}
 */
function clone(id) {
	if (gui.Client.isExplorer11) {
		ts.ui.Notification.warning("Sorry, this page doesn't work in IE :(");
	} else {
		return document.querySelector(id + '-template').content.cloneNode(true);
	}
}

/**
 * Firefox will persist the form selection on refresh, so we'll account for that.
 */
ts.ui.ready(function initform() {
	document.querySelector('input[type=radio]:checked').onchange();
});
