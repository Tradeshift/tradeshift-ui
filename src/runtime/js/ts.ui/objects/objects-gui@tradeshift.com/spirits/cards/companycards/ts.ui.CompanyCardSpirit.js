/**
 * Spirit of the Tradeshift object.
 * @extends {ts.ui.CardSpirit}
 */
ts.ui.CompanyCardSpirit = ts.ui.CardSpirit.extend(
	{
		/**
		 * TODO: Maybe add logic here to hide
		 * the logo until it's fully loaded?
		 */
		onrender: function() {
			this.super.onrender();
		},

		/**
		 * @experimental
		 * From the future.
		 */
		open: function() {
			if (this._model) {
				this._openaside(ts.ui.CompanyCardModel.from(this._model));
				console.warn("This is an experimental feature. Please don't use it.");
			} else {
				throw new Error(this + ' has no data');
			}
		},

		/**
		 * TODO: This is just mockup stuff, don't use it yet!
		 * @param {ts.ui.CompanyCardModel} model
		 */
		_openaside: function(clone) {
			clone.type = 'ts-details';
			var aside = ts.ui
				.Aside({
					title: clone.data.name || '',
					items: [
						clone,
						{
							item: 'menu',
							items: [
								'Create Document…',
								'Invite',
								'Categorize As…',
								'Properties…',
								'Remove Company'
							].map(function(label) {
								return {
									label: label
								};
							})
						}
					]
				})
				.open();

			/*
			 * We need to implement a menu.onchange() callback of some kind
			 * now that the menu items have been refactored to "simple" data.
			 */
			(function tempworkaround(menu) {
				menu.addObserver({
					onchange: function(changes) {
						if (changes[0].name === 'selectedIndex') {
							aside.close();
							aside.onclosed = function() {
								ts.ui.Notification.success('To be continued...');
								menu.removeObserver(this);
								aside.dispose();
							};
						}
					}
				});
			})(aside.items[1]);
		}
	},
	{
		// Static .................................................................

		/**
		 * Convert injected JSON to this kind of model.
		 * @see {ts.ui.ObjectSpirit}
		 * @type {constructor}
		 */
		model: ts.ui.CompanyCardModel,

		/**
		 * Fetch the model from this kind of collection.
		 * @see {ts.ui.ObjectSpirit}
		 * @type {constructor}
		 */
		collection: ts.ui.CompanyCardCollection,

		/**
		 * Dummy model used to render a preloader-layout.
		 * No real data in it, so all can share the same.
		 * @type {ts.ui.CompanyCardModel}
		 */
		MOCK_MODEL: new ts.ui.CompanyCardModel({
			id: gui.KeyMaster.generateGUID(),
			mock: true,
			data: {
				name: 'Company Name',
				size: '123',
				location: 'Company Location, Country',
				industry: 'Company Industry'
			}
		})
	}
);
