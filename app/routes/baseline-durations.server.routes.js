'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var baselineDurations = require('../../app/controllers/baseline-durations.server.controller');

	// Baseline durations Routes
	app.route('/baseline-durations')
		.get(users.requiresLogin, baselineDurations.list)
		.post(users.requiresLogin, baselineDurations.hasAuthorization, baselineDurations.create);

	app.route('/baseline-durations/:baselineDurationId')
		.get(users.requiresLogin, baselineDurations.read)
		.put(users.requiresLogin, baselineDurations.hasAuthorization, baselineDurations.update)
		.delete(users.requiresLogin, baselineDurations.hasAuthorization, baselineDurations.delete);

	// Finish by binding the Baseline duration middleware
	app.param('baselineDurationId', baselineDurations.baselineDurationByID);
};
