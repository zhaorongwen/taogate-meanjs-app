'use strict';

//Project milestones service used to communicate Project milestones REST endpoints
angular.module('project-milestones').factory('ProjectMilestones', ['$resource',
	function($resource) {
		return $resource('project-milestones/:projectMilestoneId', { projectMilestoneId: '@_id'
		}, {
			update: {
				method: 'PUT'
			},
            
			// --- Header --

			updateHeader: {
				method: 'PUT',
				url: 'project-milestones/:projectMilestoneId/header'
				// req.body: {whole milestone object}
			},

			// --- Status --

			updateStatus: {
				method: 'PUT',
				url: 'project-milestones/:projectMilestoneId/status'
				// req.body: {whole milestone object}
			}
		});
	}
]);
