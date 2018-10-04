(function runAfterTick() {
	setTimeout(function runAsync() {
		ts.ui.ready(function runWhenReady() {
			$('.btn-select').each(function(i) {
				const selector = this.dataset.selector;
				const method = this.dataset.method;
				const value = this.dataset.value;
				$(this).text(`$('#multi-select ${selector}').${method}('selected', ${value})`);
			});
			$('.btn-select').click(e => {
				const target = e.target;
				const selector = target.dataset.selector;
				const method = target.dataset.method;
				const value = ['true', 'false'].includes(target.dataset.value)
					? target.dataset.value === 'true'
					: target.dataset.value;

				console.log("Running $('#multi-select %s').%s('selected', %s)", selector, method, value);
				$(`#multi-select ${selector}`)[method]('selected', value);
			});
		});
	}, 0);
})();
