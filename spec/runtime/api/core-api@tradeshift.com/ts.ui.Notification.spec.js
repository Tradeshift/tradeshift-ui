describe('ts.ui.Notification', function likethis() {
	// Preparations ..............................................................

	/**
	 * Get body of latest notification. Account for
	 * notifications lingering from previous tests.
	 * @returns {HTMLDivElement}
	 */
	function getlatest() {
		var list = document.querySelectorAll('.ts-dialog');
		var last = gui.Array.from(list).pop();
		return last.querySelector('.ts-dialog-body');
	}

	/**
	 * Wait for dialog to fade in.
	 * @param {function} action
	 */
	function waitfordialog(action) {
		setTimeout(function wait() {
			action();
		}, 500);
	}

	// Expectations ..............................................................

	it('should support markdown for formatting', function(done) {
		var text = 'Markdown for **bold text** and *italic text* and `source code`';
		var note = ts.ui.Notification.info(text);
		waitfordialog(function() {
			var body = getlatest();
			var html = body.innerHTML;
			['<strong>', '<em>', '<code>'].forEach(function(tag) {
				expect(html).toContain(tag);
			});
			note.accept();
			done();
		});
	});

	it('should support markdown for links', function(done) {
		var text = 'Markdown for [link text](and_link_url)';
		var note = ts.ui.Notification.info(text);
		waitfordialog(function() {
			var body = getlatest();
			var html = body.innerHTML;
			expect(html).toContain('<a');
			expect(html).toContain('data-ts="Button"');
			expect(html).toContain('data-ts.data="and_link_url"');
			note.accept();
			done();
		});
	});

	it('should support markdown old syntax for links', function(done) {
		var text = 'Markdown for (link text)[and_link_url]';
		var note = ts.ui.Notification.info(text);
		waitfordialog(function() {
			var body = getlatest();
			var html = body.innerHTML;
			expect(html).toContain('<a');
			expect(html).toContain('data-ts="Button"');
			expect(html).toContain('data-ts.data="and_link_url"');
			note.accept();
			done();
		});
	});

	it('should support multiple links', function(done) {
		var text = 'Choose link [one](ONE) or [two](TWO) or [three](THREE).';
		var note = ts.ui.Notification.info(text);
		waitfordialog(function() {
			var body = getlatest();
			var linx = body.querySelectorAll('a');
			expect(linx.length).toBe(3);
			note.accept();
			done();
		});
	});

	it('should support multiple links old syntax', function(done) {
		var text = 'Choose link (one)[ONE] or (two)[TWO] or (three)[THREE].';
		var note = ts.ui.Notification.info(text);
		waitfordialog(function() {
			var body = getlatest();
			var linx = body.querySelectorAll('a');
			expect(linx.length).toBe(3);
			note.accept();
			done();
		});
	});

	it('should support multiple mixed links', function(done) {
		var text = 'Choose link [one](ONE) or (two)[TWO] or (three)[THREE].';
		var note = ts.ui.Notification.info(text);
		waitfordialog(function() {
			var body = getlatest();
			var linx = body.querySelectorAll('a');
			expect(linx.length).toBe(3);
			note.accept();
			done();
		});
	});

	it('should block the link text HaCkErZ', function(done) {
		var hack = '<span onclick="SuCkErZ()">linktext</span>';
		var text = 'Markdown for [' + hack + '](mylink)';
		var note = ts.ui.Notification.info(text);
		waitfordialog(function() {
			var body = getlatest();
			var span = body.querySelector('span');
			expect(span).toBe(null); // it stays as markdown
			note.accept();
			done();
		});
	});

	it('should block the link(old) text HaCkErZ', function(done) {
		var hack = '<span onclick="SuCkErZ()">linktext</span>';
		var text = 'Markdown for (' + hack + ')[mylink]';
		var note = ts.ui.Notification.info(text);
		waitfordialog(function() {
			var body = getlatest();
			var span = body.querySelector('span');
			expect(span).toBe(null); // it stays as markdown
			note.accept();
			done();
		});
	});

	it('should block the link href HaCkErZ', function(done) {
		var hack = '" onclick="SuCkErZ()';
		var text = 'Markdown for (link text)[' + hack + ']';
		var note = ts.ui.Notification.info(text);
		waitfordialog(function() {
			var body = getlatest();
			var link = body.querySelector('a');
			expect(link).toBe(null); // it stays as markdown
			note.accept();
			done();
		});
	});

	it('should block the link(new) href HaCkErZ', function(done) {
		var hack = '" onclick="SuCkErZ()';
		var text = 'Markdown for [link text](' + hack + ')';
		var note = ts.ui.Notification.info(text);
		waitfordialog(function() {
			var body = getlatest();
			var link = body.querySelector('a');
			expect(link).toBe(null); // it stays as markdown
			note.accept();
			done();
		});
	});
});
