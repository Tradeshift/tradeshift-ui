var ScreenShotCollection = edb.Array.extend();
$.getJSON('/screenshots/diffs.json', function(json) {
	if (json.length) {
		ts.ui.TopBar.tabs(
			json.map((entry, index) => {
				return {
					label: entry.browser,
					selected: !index,
					onselect: () => {
						new ScreenShotCollection(entry.diffs).output();
					}
				};
			})
		).buttons([
			{
				label: 'Instructions',
				onclick: () => {
					ts.ui.Notification.info(
						[
							'Left image expected, right image found.',
							'Hover right image to higlight changes.',
							'Click either image to inspect in 100%.',
							'Click header to open associated page.'
						].join('\n\n'),
						'Got It'
					);
				}
			}
		]);
	} else {
		new ScreenShotCollection().output();
	}
});
