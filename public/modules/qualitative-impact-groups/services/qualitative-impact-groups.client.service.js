'use strict';

//Qualitative impact groups service used to communicate Qualitative impact groups REST endpoints
angular.module('qualitative-impact-groups').factory('QualitativeImpactGroups', ['$resource',
	function($resource) {
		return $resource('qualitative-impact-groups/:qualitativeImpactGroupId', { qualitativeImpactGroupId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);