'use strict';

//Portfolio rankings service used to communicate Portfolio rankings REST endpoints
angular.module('portfolio-ranking-assignment').factory('PortfolioRankings', ['$resource',
	function($resource) {
		return $resource('portfolio-rankings/:portfolioRankingId', { portfolioRankingId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
