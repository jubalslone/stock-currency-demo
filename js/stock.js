window.stock = angular.module('stock', []);

window.stock.service('stockService',
	['$http', 'stockSettings','$q',
	function ($http, stockSettings, $q) {

		this.getStockData = function(stocks,isSecure) {
			if ( !stocks ) {
				 return $q.reject();
			}

			// dev.markitondemand.com doesn't accept https requests, so return cached information instead of failing
			if (isSecure) {
				return transformStockData('{"Status":"SUCCESS","Name":"Alphabet Inc","Symbol":"GOOGL","LastPrice":767.93,"Change":9.3599999999999,"ChangePercent":1.23390062881473,"Timestamp":"Wed Apr 6 15:59:00 UTC-04:00 2016","MSDate":42466.6659722222,"MarketCap":263231045400,"Volume":75130,"ChangeYTD":778.01,"ChangePercentYTD":-1.29561316692588,"High":768.24,"Low":757.73,"Open":757.73}');
			} else {
				stocks = stocks.replace(/ /g,''); //remove any spaces
				var finalUrl = stockSettings.stockPath;
				return $http.get(finalUrl).success(function() {
					data = transformStockData(data);
				})
				.error(function() {
					console.info("Server returned bad response: ", data);
					data = { error: true };
				});
			}

			/*
			Expected response literal:

			{"Status":"SUCCESS","Name":"Alphabet Inc","Symbol":"GOOGL","LastPrice":767.93,"Change":9.3599999999999,"ChangePercent":1.23390062881473,"Timestamp":"Wed Apr 6 15:59:00 UTC-04:00 2016","MSDate":42466.6659722222,"MarketCap":263231045400,"Volume":75130,"ChangeYTD":778.01,"ChangePercentYTD":-1.29561316692588,"High":768.24,"Low":757.73,"Open":757.73}

			*/
		};

		var transformStockData = function(data) {
			return JSON.parse(data);
		};

		this.getCurrencyData = function() {
			var finalUrl = stockSettings.currencyPath;
			return $http.get(finalUrl);
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
						var newCall = stockService.getStockData($scope.newCard,$scope.isSecure);
						newCall.formattedTime = new Date(newCall.Timestamp);
						$scope.stockData.cards.unshift(newCall);
						$scope.newCard = "";
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

				// onload
				if (window.location.protocol != "http:") {
					// I see no reason to do something like this in production; this is only for purposes of the demonstration and the local and free hosts that can cause issues
					$scope.isSecure = true;
				}
			}
		]
	);
}(window.stock));

(function(app) {
	app.config([
		'$provide',
		function ($provide) {
			var appSettings = {
				stockPath: 'http://dev.markitondemand.com/MODApis/Api/v2/Quote/json?',
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