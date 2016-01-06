'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	async = require('async'),
	_ = require('lodash');

/**
 * Create a Portfolio issue
 */
exports.create = function(req, res) {
	var Counter = mongoose.mtModel(req.user.tenantId + '.' + 'Counter');
	var PortfolioIssue = mongoose.mtModel(req.user.tenantId + '.' + 'PortfolioIssue');

	var portfolioIssue = new PortfolioIssue(req.body);

	portfolioIssue.user = req.user;
	portfolioIssue.statusReview = {
		currentRecord : { user : req.user, completed : false},
		history : []
	};
	portfolioIssue.escalationActions = [];

	async.series([
		// Add the sequential number
		function(callback){
			Counter.findByIdAndUpdate({_id: 'portfolioIssueSequence'}, {$inc: { seq: 1} }, function(error, counter)   {
				if(error){
					return callback(error);
				}
				// Must create the the document in 'counter' collection for our entity the first time we create an entity document
				if(!counter){
					var newCounter = new Counter({
						_id : 'portfolioIssueSequence'
					});
					newCounter.save(function(err){
						if(err){
							return callback( new Error('Failed to create sequence counter for Portfolio issue'));
						}
						portfolioIssue.idNumber = 1;
						callback(null);
					});
				}
				if(counter) {
					portfolioIssue.idNumber = counter.seq;
					callback(null);
				}
			});
		},
		function(callback){
			portfolioIssue.save(function(err) {
				callback(err);
			});
		}
	], function(err){
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(portfolioIssue);
		}
	});
};

/**
 * Show the current Portfolio issue
 */
exports.read = function(req, res) {
	res.jsonp(req.portfolioIssue);
};

/**
 * Update a Portfolio issue
 */
exports.update = function(req, res) {
	var portfolioIssue = req.portfolioIssue ;
	portfolioIssue.user = req.user;
	portfolioIssue.created = Date.now();
	portfolioIssue = _.extend(portfolioIssue , req.body);

	portfolioIssue.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(portfolioIssue);
		}
	});
};



exports.updateHeader = function(req, res) {

	var portfolioIssue = req.portfolioIssue ;

    portfolioIssue.user = req.user;
    portfolioIssue.created = Date.now();

    portfolioIssue.raisedOnDate = req.body.raisedOnDate;
    portfolioIssue.title = req.body.title;
    portfolioIssue.description = req.body.description;
    portfolioIssue.reason = req.body.reason;
    portfolioIssue.state = req.body.state;
    portfolioIssue.priority = req.body.priority;

    portfolioIssue.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(portfolioIssue);
		}
	});

};

exports.updateStatus = function(req, res) {

	var portfolioIssue = req.portfolioIssue ;

    portfolioIssue.statusReview.history.push({
		baselineDeliveryDate : portfolioIssue.statusReview.currentRecord.baselineDeliveryDate,
		estimateDeliveryDate : portfolioIssue.statusReview.currentRecord.estimateDeliveryDate,
		actualDeliveryDate : portfolioIssue.statusReview.currentRecord.actualDeliveryDate,
		status : portfolioIssue.statusReview.currentRecord.status,
		completed : portfolioIssue.statusReview.currentRecord.completed,
		statusComment : portfolioIssue.statusReview.currentRecord.statusComment
	});
    portfolioIssue.statusReview.currentRecord.user = req.user;
    portfolioIssue.statusReview.currentRecord.created = Date.now();
    portfolioIssue.statusReview.currentRecord.baselineDeliveryDate = req.body.statusReview.currentRecord.baselineDeliveryDate;
    portfolioIssue.statusReview.currentRecord.estimateDeliveryDate = req.body.statusReview.currentRecord.estimateDeliveryDate;
    portfolioIssue.statusReview.currentRecord.actualDeliveryDate = req.body.statusReview.currentRecord.actualDeliveryDate;
    portfolioIssue.statusReview.currentRecord.status = req.body.statusReview.currentRecord.status;
    portfolioIssue.statusReview.currentRecord.completed = req.body.statusReview.currentRecord.completed;
    portfolioIssue.statusReview.currentRecord.statusComment = req.body.statusReview.currentRecord.statusComment;

    portfolioIssue.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(portfolioIssue);
		}
	});
};



/**
 * Delete an Portfolio issue
 */
exports.delete = function(req, res) {
	var portfolioIssue = req.portfolioIssue ;

	portfolioIssue.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(portfolioIssue);
		}
	});
};

/**
 * List of Portfolio issues
 */
exports.list = function(req, res) {
    var PortfolioIssue = mongoose.mtModel(req.user.tenantId + '.' + 'PortfolioIssue');
    PortfolioIssue.find(req.query).deepPopulate([
        'reason', 'state', 'priority', 'statusReview.currentRecord.status'
    ]).populate('user', 'displayName').exec(function(err, portfolioIssues) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(portfolioIssues);
		}
	});
};


// --------------------------------------------- ACTIONS -----------------------------------------
exports.createAction = function(req, res) {

    var Counter = mongoose.mtModel(req.user.tenantId + '.' + 'Counter');
    var PortfolioIssue = mongoose.mtModel(req.user.tenantId + '.' + 'PortfolioIssue');

    var newAction = req.body;
    newAction.user = req.user;
    newAction.statusReview = {
        history : [],
        currentRecord : {
            user: req.user
        }
    };

    async.series([
        // Add the sequential number
        function(callback){
            Counter.findByIdAndUpdate({_id: 'escalationActionSequence'}, {$inc: { seq: 1} }, function(error, counter)   {
                if(error){
                    return callback(error);
                }
                // Must create the the document in 'counter' collection for our entity the first time we create an entity document
                if(!counter){
                    var newCounter = new Counter({
                        _id : 'escalationActionSequence'
                    });
                    newCounter.save(function(err){
                        if(err){
                            return callback( new Error('Failed to create sequence counter for escalation action'));
                        }
                        newAction.idNumber = 1;
                        callback(null);
                    });
                }
                if(counter) {
                    newAction.idNumber = counter.seq;
                    callback(null);
                }
            });
        },
        // Add the new action to the portfolioIssue.escalatedActions array
        function(callback){
            PortfolioIssue.findById(req.params.portfolioIssueId).exec(function(err, issue){
                if(err){
                    return callback(err);
                }
                if(!issue){
                    return callback(new Error('Failed to portfolio issue ' + req.params.portfolioIssueId));
                }
                newAction = issue.escalationActions.create(newAction);
                issue.escalationActions.push(newAction);
                issue.save(function(err){
                    callback(err);
                });
            });
        }
    ], function(err){
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(newAction);
        }
    });
};


/**
 * Portfolio issue middleware
 */
exports.portfolioIssueByID = function(req, res, next, id) {
    var PortfolioIssue = mongoose.mtModel(req.user.tenantId + '.' + 'PortfolioIssue');
    PortfolioIssue.findById(id).populate('user', 'displayName').exec(function(err, portfolioIssue) {
		if (err) return next(err);
		if (! portfolioIssue) return next(new Error('Failed to load Portfolio issue ' + id));
		req.portfolioIssue = portfolioIssue ;
		next();
	});
};

/**
 * Portfolio issue authorization middleware
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