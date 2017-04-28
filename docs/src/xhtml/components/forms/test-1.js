/*
 * Testing async injection of options.
 */
(function setup() {
	setTimeout(function somethingasync() {
		// select one
		var select = document.querySelector('#outsideselect');
		select.innerHTML = [
			'<option value="1">One</option>',
			'<option value="2">Two</option>',
			'<option value="3">Three</option>'
		].join('\n');

		// select multi
		var multi = document.querySelector('#outsideselectmultiple');
		multi.innerHTML = [
			'<option value="a" selected>One</option>',
			'<option value="b" selected>Two</option>',
			'<option value="c">Three</option>',
			'<option value="d">Four</option>',
			'<option value="e">Five</option>'
		].join('\n');
	});
})();

/*
 * Testing async injection in Angular.
 * @using {Angular} angular
 */
(function setup(angular) {
	angular.module('app', []).controller('TestController', [
		'$scope',
		function TestController($scope) {
			setTimeout(function somethingasync() {
				// testing nesting
				$scope.testList1 = [1];
				$scope.testList2 = [2];
				$scope.testList3 = [3];

				// testing select one
				$scope.typeOptions = [
					{ name: 'One', value: '1' },
					{ name: 'Two', value: '2' },
					{ name: 'Three', value: '3' }
				];
				$scope.typeOption = $scope.typeOptions[0].value;

				// testing select multi
				$scope.colors = [
					{
						name: 'black',
						shade: 'dark'
					},
					{
						name: 'white',
						shade: 'light'
					},
					{
						name: 'red',
						shade: 'dark'
					},
					{
						name: 'blue',
						shade: 'dark'
					},
					{
						name: 'yellow',
						shade: 'light'
					}
				];
				$scope.selectedColors = [$scope.colors[0], $scope.colors[1]];

				// digest this
				$scope.$digest();

				// test ng-disabled
				(function repeat() {
					$scope.$apply(function() {
						$scope.selectDisabled = !$scope.selectDisabled;
					});
					setTimeout(repeat, 2000);
				})();
			}, 500);
		}
	]);
})(window.angular);
