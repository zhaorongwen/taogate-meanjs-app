'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	async = require('async'),
	_ = require('lodash');

/**
 * Create a People category value
 */
exports.create = function(req, res) {
	var PeopleCategoryValue = mongoose.mtModel(req.user.tenantId + '.' + 'PeopleCategoryValue');
	var peopleCategoryValue = new PeopleCategoryValue(req.body);
	peopleCategoryValue.user = req.user;

	peopleCategoryValue.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(peopleCategoryValue);
		}
	});
};

/**
 * Show the current People category value
 */
exports.read = function(req, res) {
	res.jsonp(req.peopleCategoryValue);
};

/**
 * Update a People category value
 */
exports.update = function(req, res) {
	var peopleCategoryValue = req.peopleCategoryValue ;
    peopleCategoryValue.user = req.user;
    peopleCategoryValue.created = Date.now();
	peopleCategoryValue = _.extend(peopleCategoryValue , req.body);

	peopleCategoryValue.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(peopleCategoryValue);
		}
	});
};

/**
 * Delete an People category value
 */
exports.delete = function(req, res) {
	var peopleCategoryValue = req.peopleCategoryValue ;
    var PeopleCategory = mongoose.mtModel(req.user.tenantId + '.' + 'PeopleCategory');

    async.series([
        function(callback){
            // Delete category value from its collection
            peopleCategoryValue.remove();
            callback(null, 'one');
        },
        function(callback){
            // Delete value from categories where assigned
            PeopleCategory.find({categoryValues: {$in: [peopleCategoryValue._id]}}).exec(function(err, categories){
                async.each(categories, function(item, callback){
                    item.categoryValues.splice(item.categoryValues.indexOf(peopleCategoryValue._id), 1);
                    item.save();
                    callback();
                });
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
            res.jsonp(peopleCategoryValue);
        }
    });
};

/**
 * List of People category values
 */
exports.list = function(req, res) {
    var PeopleCategoryValue = mongoose.mtModel(req.user.tenantId + '.' + 'PeopleCategoryValue');
	PeopleCategoryValue.find().sort('-created').populate('user', 'displayName').exec(function(err, peopleCategoryValues) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(peopleCategoryValues);
		}
	});
};

/**
 * People category value middleware
 */
exports.peopleCategoryValueByID = function(req, res, next, id) {
    var PeopleCategoryValue = mongoose.mtModel(req.user.tenantId + '.' + 'PeopleCategoryValue');
	PeopleCategoryValue.findById(id).populate('user', 'displayName').exec(function(err, peopleCategoryValue) {
		if (err) return next(err);
		if (! peopleCategoryValue) return next(new Error('Failed to load People category value ' + id));
		req.peopleCategoryValue = peopleCategoryValue ;
		next();
	});
};

/**
 * People category value authorization middleware
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
