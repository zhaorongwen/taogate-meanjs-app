'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	async = require('async'),
	_ = require('lodash');

/**
 * Create a Portfolio ranking
 */
exports.create = function(req, res) {
	var PortfolioRanking = mongoose.mtModel(req.user.tenantId + '.' + 'PortfolioRanking');
	var portfolioRanking = new PortfolioRanking(req.body);
	portfolioRanking.user = req.user;

	portfolioRanking.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(portfolioRanking);
		}
	});
};

/**
 * Show the current Portfolio ranking
 */
exports.read = function(req, res) {
	res.jsonp(req.portfolioRanking);
};

/**
 * Update a Portfolio ranking
 */
exports.update = function(req, res) {
	var portfolioRanking = req.portfolioRanking ;
    portfolioRanking.user = req.user;
    portfolioRanking.created = Date.now();
    portfolioRanking = _.extend(portfolioRanking , req.body);

	portfolioRanking.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(portfolioRanking);
		}
	});
};

/**
 * Delete an Portfolio ranking
 */
exports.delete = function(req, res) {
	var portfolioRanking = req.portfolioRanking ;

	portfolioRanking.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(portfolioRanking);
		}
	});
};

/**
 * List of Portfolio rankings
 */
exports.list = function(req, res) {
    var PortfolioRanking = mongoose.mtModel(req.user.tenantId + '.' + 'PortfolioRanking');

    if(req.query.portfolioId){
        PortfolioRanking.findOne({portfolio: req.query.portfolioId}).populate('user', 'displayName').populate('projects')
            .exec(function(err, portfolioRanking){
                // Remove the projects that have been:
                // 1) unassigned or
                // 2) assigned to another portfolio or
                // 3) Not selected for prioritization or
                // 4) Inactive
            async.each(portfolioRanking.projects, function(project, callback) {
                if(project){
                    if(project.portfolio === null || !project.portfolio.equals(req.query.portfolioId) || project.selection.selectedForPrioritization === false || project.selection.active === false){
                        portfolioRanking.projects.splice(portfolioRanking.projects.indexOf(project), 1);
                        portfolioRanking.save();
                    }
                }
                callback();
            }, function(err){
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    res.jsonp(portfolioRanking);
                }
            });
        });
    } else {
        PortfolioRanking.find().populate('user', 'displayName').exec(function(err, portfolioRankings) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.jsonp(portfolioRankings);
            }
        });
    }
};

/**
 * Portfolio ranking middleware
 */
exports.portfolioRankingByID = function(req, res, next, id) {
    var PortfolioRanking = mongoose.mtModel(req.user.tenantId + '.' + 'PortfolioRanking');
	PortfolioRanking.findById(id).populate('user', 'displayName').populate('portfolio').exec(function(err, portfolioRanking) {
		if (err) return next(err);
		if (! portfolioRanking) return next(new Error('Failed to load Portfolio ranking ' + id));
		req.portfolioRanking = portfolioRanking ;
		next();
	});
};

/**
 * Portfolio ranking authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
    var isPortfolioManager, isBackupPortfolioManager, isSuperhero;
    if(req.portfolioRanking.portfolio.portfolioManager){
        isPortfolioManager = req.portfolioRanking.portfolio.portfolioManager.equals(req.user._id);
    }
    if(req.portfolioRanking.portfolio.backupPortfolioManager){
        isBackupPortfolioManager = req.portfolioRanking.portfolio.backupPortfolioManager.equals(req.user._id);
    }
    isSuperhero = !!_.find(req.user.roles, function(role){
        return (role === 'superAdmin' || role === 'admin' || role === 'pmo');
    });
    if(!(isPortfolioManager || isBackupPortfolioManager || isSuperhero)){
        return res.status(403).send({
            message: 'User is not authorized'
        });
    }
    next();
};
