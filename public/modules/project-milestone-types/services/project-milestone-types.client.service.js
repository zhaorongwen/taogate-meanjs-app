'use strict';

//Project milestone types service used to communicate Project milestone types REST endpoints
angular.module('project-milestone-types').factory('ProjectMilestoneTypes', ['$resource',
	function($resource) {
		return $resource('project-milestone-types/:projectMilestoneTypeId', { projectMilestoneTypeId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);