window.stock = angular.module('stock', []);

window.stock.service('stockService',
	['$http', 'stockSettings','$q',
	function ($http, stockSettings, $q) {

		this.getStockData = function(stocks) {
			if ( !stocks ) {
				 return $q.reject();
			}

			stocks = stocks.replace(/ /g,''); //remove any spaces

			var finalUrl = stockSettings.stockPath;

			// return $http.get(finalUrl).success(function() {
			// 	data = transformStockData(data);
			// })
			// .error(function() {
			// 	data = "error";
			// });;
			return transformStockData('// [ { "id": "304466804484872" ,"t" : "GOOG" ,"e" : "NASDAQ" ,"l" : "745.69" ,"l_fix" : "745.69" ,"l_cur" : "745.69" ,"s": "2" ,"ltt":"4:00PM EDT" ,"lt" : "Apr 6, 4:00PM EDT" ,"lt_dts" : "2016-04-06T16:00:01Z" ,"c" : "+7.89" ,"c_fix" : "7.89" ,"cp" : "1.07" ,"cp_fix" : "1.07" ,"ccol" : "chg" ,"pcls_fix" : "737.8" ,"el": "745.68" ,"el_fix": "745.68" ,"el_cur": "745.68" ,"elt" : "Apr 6, 4:37PM EDT" ,"ec" : "-0.01" ,"ec_fix" : "-0.01" ,"ecp" : "0.00" ,"ecp_fix" : "0.00" ,"eccol" : "chr" ,"div" : "" ,"yld" : "" } ,{ "id": "658890" ,"t" : "YHOO" ,"e" : "NASDAQ" ,"l" : "36.66" ,"l_fix" : "36.66" ,"l_cur" : "36.66" ,"s": "2" ,"ltt":"4:00PM EDT" ,"lt" : "Apr 6, 4:00PM EDT" ,"lt_dts" : "2016-04-06T16:00:01Z" ,"c" : "+0.25" ,"c_fix" : "0.25" ,"cp" : "0.69" ,"cp_fix" : "0.69" ,"ccol" : "chg" ,"pcls_fix" : "36.41" ,"el": "36.61" ,"el_fix": "36.61" ,"el_cur": "36.61" ,"elt" : "Apr 6, 4:39PM EDT" ,"ec" : "-0.05" ,"ec_fix" : "-0.05" ,"ecp" : "-0.14" ,"ecp_fix" : "-0.14" ,"eccol" : "chr" ,"div" : "" ,"yld" : "" } ]');
			/*
			Expected response literal:

			// [ { "id": "304466804484872" ,"t" : "GOOG" ,"e" : "NASDAQ" ,"l" : "745.69" ,"l_fix" : "745.69" ,"l_cur" : "745.69" ,"s": "2" ,"ltt":"4:00PM EDT" ,"lt" : "Apr 6, 4:00PM EDT" ,"lt_dts" : "2016-04-06T16:00:01Z" ,"c" : "+7.89" ,"c_fix" : "7.89" ,"cp" : "1.07" ,"cp_fix" : "1.07" ,"ccol" : "chg" ,"pcls_fix" : "737.8" ,"el": "745.68" ,"el_fix": "745.68" ,"el_cur": "745.68" ,"elt" : "Apr 6, 4:37PM EDT" ,"ec" : "-0.01" ,"ec_fix" : "-0.01" ,"ecp" : "0.00" ,"ecp_fix" : "0.00" ,"eccol" : "chr" ,"div" : "" ,"yld" : "" } ,{ "id": "658890" ,"t" : "YHOO" ,"e" : "NASDAQ" ,"l" : "36.66" ,"l_fix" : "36.66" ,"l_cur" : "36.66" ,"s": "2" ,"ltt":"4:00PM EDT" ,"lt" : "Apr 6, 4:00PM EDT" ,"lt_dts" : "2016-04-06T16:00:01Z" ,"c" : "+0.25" ,"c_fix" : "0.25" ,"cp" : "0.69" ,"cp_fix" : "0.69" ,"ccol" : "chg" ,"pcls_fix" : "36.41" ,"el": "36.61" ,"el_fix": "36.61" ,"el_cur": "36.61" ,"elt" : "Apr 6, 4:39PM EDT" ,"ec" : "-0.05" ,"ec_fix" : "-0.05" ,"ecp" : "-0.14" ,"ecp_fix" : "-0.14" ,"eccol" : "chr" ,"div" : "" ,"yld" : "" } ]

			*/
		};

		var transformStockData = function(data) {
			return JSON.parse(data.replace("// ",""));
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
						var newCall = stockService.getStockData($scope.newCard);
						for (var symbol in newCall) {
							$scope.stockData.cards.unshift(newCall[symbol]);
						}
						$scope.newCard = "";
					}
				};

				$scope.removeCard = function(index) {
					if (index > -1) {
						$scope.stockData.cards.splice(index, 1);
					}
				};

				// Fisher–Yates shuffle algorithm
				var shuffleArray = function(array) {
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
				shuffleArray($scope.stockData.cards);
			}
		]
	);
}(window.stock));

(function(app) {
	app.config([
		'$provide',
		function ($provide) {
			var appSettings = {
				stockPath: 'http://www.google.com/finance/info?q=NSE:',
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