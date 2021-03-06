'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var issueStates = require('../../app/controllers/issue-states.server.controller');

	// Issue states Routes
	app.route('/issue-states')
		.get(users.requiresLogin, issueStates.list)
		.post(users.requiresLogin, issueStates.hasAuthorization, issueStates.create);

	app.route('/issue-states/:issueStateId')
		.get(users.requiresLogin, issueStates.read)
		.put(users.requiresLogin, issueStates.hasAuthorization, issueStates.update)
		.delete(users.requiresLogin, issueStates.hasAuthorization, issueStates.delete);

	// Finish by binding the Issue state middleware
	app.param('issueStateId', issueStates.issueStateByID);
};
