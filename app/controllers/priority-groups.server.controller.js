'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	async = require('async'),
	_ = require('lodash');

/**
 * Create a Priority group
 */
exports.create = function(req, res) {
	var Project = mongoose.mtModel(req.user.tenantId + '.' + 'Project');
	var PriorityGroup = mongoose.mtModel(req.user.tenantId + '.' + 'PriorityGroup');
	var priorityGroup = new PriorityGroup(req.body);
	priorityGroup.user = req.user;

	async.series([
		// GROUP: Save Group in its collection
		function(callback){
			priorityGroup.save();
			callback(null, 'one');
		},
		// PROJECTS: Add new group to all projects
		function(callback){
			Project.find().exec(function(err, projects){
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					async.each(projects, function(project, callback){
						project.prioritization.push({
							group: priorityGroup._id,
							priorities: []
						});
						project.save();
						callback();
					});
				}
			});
			callback(null, 'two');
		}
	],function(err, results){
		// results is now equal to ['one', 'two']
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(priorityGroup);
		}
	});
};

/**
 * Show the current Priority Group
 */
exports.read = function(req, res) {
	res.jsonp(req.priorityGroup);
};

/**
 * Update a Priority Group
 */
exports.update = function(req, res) {
	var priorityGroup = req.priorityGroup ;
	priorityGroup.user = req.user;
	priorityGroup.created = Date.now();
	priorityGroup = _.extend(priorityGroup , req.body);

	priorityGroup.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(priorityGroup);
		}
	});
};

/**
 * Delete an Priority Group
 */
exports.delete = function(req, res) {
    var Project = mongoose.mtModel(req.user.tenantId + '.' + 'Project');
	var PriorityGroup = mongoose.mtModel(req.user.tenantId + '.' + 'PriorityGroup');
	var Priority = mongoose.mtModel(req.user.tenantId + '.' + 'Priority');
	var priorityGroup = req.priorityGroup ;

    async.series([
        // PRIORITY-GROUP: Delete Group from its collection
        function(callback){
            priorityGroup.remove();
            callback(null, 'one');
        },
        // PRIORITIES: Delete all priorities (from "priorities" collection) belonging to this Group
        function(callback){
            async.each(priorityGroup.priorities, function(item, callback){
                Priority.findByIdAndRemove(item._id, callback);
            });
            callback(null, 'three');
        },
        // PROJECTS: Delete group object from project.prioritization
        function(callback){
            Project.find().exec(function(err, projects){
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    async.each(projects, function(project, callback){
                        async.each(project.prioritization, function(assignedGroup, callback){
                            if(assignedGroup.group.equals(priorityGroup._id)){
                                assignedGroup.remove();
                            }
                            callback();
                        });
                        project.save();
                        callback();
                    });
                }
            });
            callback(null, 'three');
        }
    ],function(err, results){
        // results is now equal to ['one', 'two']
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(priorityGroup);
        }
    });
};

/**
 * List of Priority groups
 */
exports.list = function(req, res) {
	var PriorityGroup = mongoose.mtModel(req.user.tenantId + '.' + 'PriorityGroup');
	PriorityGroup.find().deepPopulate(['priorities']).populate('user', 'displayName').exec(function(err, priorityGroups) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(priorityGroups);
		}
	});
};

/**
 * Priority Group middleware
 */
exports.priorityGroupByID = function(req, res, next, id) {
	var PriorityGroup = mongoose.mtModel(req.user.tenantId + '.' + 'PriorityGroup');
	PriorityGroup.findById(id).deepPopulate(['priorities']).populate('user', 'displayName').exec(function(err, priorityGroup) {
		if (err) return next(err);
		if (! priorityGroup) return next(new Error('Failed to load Priority group ' + id));
		req.priorityGroup = priorityGroup ;
		next();
	});
};

/**
 * Priority Group authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	// User role check
	if(!_.find(req.user.roles, function(role){
			return (role === 'superAdmin' || role === 'admin' || role === 'pmo');
		})
	){
		return res.status(403).send({
			message: 'User is not authorized'
		});
	}
	next();
};
