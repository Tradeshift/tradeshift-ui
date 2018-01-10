function Controller($scope) {
	var model = {
		page: 0,
		pageSize: 5,
		total: 8
	};
	var selectedModel = {
		all: false,
		items: []
	};

	function getRows() {
		var rows = [],
			i,
			n;
		for (i = 0; i < model.pageSize; i++) {
			n = model.page * model.pageSize + i + 1;
			if (n > model.total) break;
			rows.push({
				selected: selectedModel.all || selectedModel.items[n - 1],
				cells: [
					{
						text: 'cell ' + n + '-1'
					},
					{
						text: 'cell ' + n + '-2'
					}
				]
			});
		}
		return rows;
	}

	var cols = [
		{
			label: 'column 1',
			flex: 5,
			wrap: true
		},
		{
			label: 'column 2'
		}
	];

	ts.ui.ready(function() {
		var table = ts.ui.get('grid');
		table.cols(cols);
		table.max(model.pageSize).pager({
			page: model.page,
			pages: model.total / model.pageSize,
			onselect: function(n) {
				$scope.$apply(function() {
					model.page = n;
				});
			}
		});
		table.rows(getRows());

		$scope.$watch(
			angular.bind(this, function() {
				return model;
			}),
			function() {
				table.rows(getRows());
			},
			true
		);

		table.selectable(
			function onselect(selected, unselected) {
				$scope.$apply(selectOffers(selected, unselected));
			},
			function onselectall() {
				$scope.$apply(selectOffers(true));
			},
			function onunselectall() {
				$scope.$apply(selectOffers(false));
			}
		);
	});

	function selectOffers(selectedOrSelectAll, unselected) {
		if (typeof selectedOrSelectAll === 'boolean') {
			selectedModel.all = selectedOrSelectAll;
		} else {
			selectedModel.all = false;
			var selected = selectedOrSelectAll;
			if (selected) {
				selected.forEach(function(i) {
					selectedModel.items[model.page * model.pageSize + i] = 1;
				});
			}
			if (unselected) {
				unselected.forEach(function(i) {
					delete selectedModel.items[model.page * model.pageSize + i];
				});
			}
		}
	}

	angular.extend(this, {
		model: model
	});
}

window.angular.module('app', []).controller('Controller', ['$scope', Controller]);
