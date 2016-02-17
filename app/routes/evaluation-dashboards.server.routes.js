'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var evaluationDashboards = require('../../app/controllers/evaluation-dashboards.server.controller');

	// Evaluation dashboards Routes
	app.route('/evaluation-dashboards/financialProfile/:projectId')
		.get(users.requiresLogin, evaluationDashboards.hasAuthorization, evaluationDashboards.financialProfile);

	app.route('/evaluation-dashboards/qualitativeProfiles')
		.get(users.requiresLogin, evaluationDashboards.hasAuthorization, evaluationDashboards.qualitativeProfiles);

	app.route('/evaluation-dashboards/qualitativeSummary')
		.get(users.requiresLogin, evaluationDashboards.hasAuthorization, evaluationDashboards.qualitativeSummary);
};
