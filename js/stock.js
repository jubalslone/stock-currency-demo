window.stock = angular.module('stock', []);

window.stock.service('stockService',
	['$http', 'stockSettings','$q',
	function ($http, stockSettings, $q) {

		this.getStockData = function(stockRequest,isSecure) {
			if ( !stockRequest ) {
				 return $q.reject();
			}

			stockRequest = stockRequest.replace(/ /g,''); //remove any spaces
			var finalUrl = stockSettings.stockPath + stockRequest;
			return $http.jsonp(finalUrl).success(function(data) {
				data = data;
			})
			.error(function(data) {
				console.info("Server returned bad response: ", data);
				data = { error: true };
			});
		};

		var transformStockData = function(data) {
			return JSON.parse(data);
		};

		this.getCurrencyData = function() {
			var finalUrl = stockSettings.currencyPath;
			return $http.get(finalUrl).success(function(data) {
				data = data;
			});
		};
	}
]);

(function(app) {
	app.controller('stockController',
		['$scope', 'stockService', 'stockSettings',
			function ($scope, stockService, stockSettings) {
				$scope.stockData = {
					cards: []
				};

				$scope.addCard = function() {
					if($scope.newCard) {
						stockService.getStockData($scope.newCard,$scope.isSecure).success(function(data) {
							data.formattedTime = new Date(data.Timestamp);
							data.currentCurrency = "USD";
							$scope.stockData.cards.unshift(data);
							$scope.newCard = "";
						});
					}
				};

				$scope.removeCard = function(index) {
					if (index > -1) {
						$scope.stockData.cards.splice(index, 1);
					}
				};

				// Fisher–Yates shuffle algorithm
				$scope.shuffleArray = function(array) {
					var m = array.length, t, i;

					// While there remain elements to shuffle
					while (m) {
						// Pick a remaining element...
						i = Math.floor(Math.random() * m--);

						// And swap it with the current element.
						t = array[m];
						array[m] = array[i];
						array[i] = t;
					}

					return array;
				};

				$scope.setPrice = function(from,to,amount) {
					var rates = $scope.currencyData.rates;
					var converted_amount = ((amount/rates[from]) * rates[to]).toFixed( 2 )
					return converted_amount;
				};

				// onload

				stockService.getCurrencyData().success(function(data) {
					$scope.currencyData = data;
					$scope.currencyData.rates.USD = 1;
				});
			}
		]
	);
}(window.stock));

(function(app) {
	app.config([
		'$provide',
		function ($provide) {
			var appSettings = {
				stockPath: 'http://dev.markitondemand.com/MODApis/Api/v2/Quote/jsonp?callback=JSON_CALLBACK&symbol=',
				currencyPath: 'http://api.fixer.io/latest?base=USD'
			};

			$provide.constant('stockSettings', appSettings);
		}
	]);
}(window.stock));

angular.module('stock').directive('ngEnter', function() {
	return function(scope, element, attrs) {
		element.bind("keydown keypress", function(event) {
			if(event.which === 13) {
				scope.$apply(function(){
					scope.$eval(attrs.ngEnter, {'event': event});
				});
				event.preventDefault();
			}
		});
	};
});