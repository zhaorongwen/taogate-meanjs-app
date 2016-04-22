'use strict';

/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    async = require('async'),
    _ = require('lodash'),
    seedIDsController = require('./seed-data/seed-data.ids.server.controller');

// -------------------------


var loadSetupData = function(user, callback){
    async.parallel([
        function(callback){
            return require('./seed-data/seed-data.category-setup.server.controller.js').seedCategories(user, callback);
        },
        function(callback){
            return require('./seed-data/seed-data.priority-setup.server.controller.js').seedPriorities(user, callback);
        },
        function(callback){
            return require('./seed-data/seed-data.financial-setup.server.controller.js').seedFinancials(user, callback);
        },
        function(callback){
            return require('./seed-data/seed-data.risk-setup.server.controller.js').seedRisks(user, callback);
        },
        function(callback){
            return require('./seed-data/seed-data.qualitative-setup.server.controller.js').seedQualitativeImpacts(user, callback);
        },
        function(callback){
            return require('./seed-data/seed-data.dependency-setup.server.controller.js').seedDependencies(user, callback);
        },
        function(callback){
            return require('./seed-data/seed-data.stakeholders-setup.server.controller.js').seedStakeholders(user, callback);
        },
        function(callback){
            return require('./seed-data/seed-data.portfolio-people.server.controller.js').seedPortfolioPeople(user, callback);
        },
        function(callback){
            return require('./seed-data/seed-data.project-people.server.controller.js').seedProjectPeople(user, callback);
        },
        function(callback){
            return require('./seed-data/seed-data.review-setup.server.controller.js').seedReviewScores(user, callback);
        },
        function(callback){
            return require('./seed-data/seed-data.project-review.server.controller.js').seedProjectReviews(user, callback);
        },
        function(callback){
            return require('./seed-data/seed-data.portfolio-review.server.controller.js').seedPortfolioReviews(user, callback);
        },
        function(callback){
            return require('./seed-data/seed-data.maturity-setup.server.controller.js').seedMaturityModels(user, callback);
        },
        function(callback){
            return require('./seed-data/seed-data.improvement-setup.server.controller.js').seedImprovements(user, callback);
        },
        function(callback){
            return require('./seed-data/seed-data.log-setup.server.controller.js').seedLogs(user, callback);
        },
        function(callback){
            return require('./seed-data/seed-data.milestone-setup.server.controller.js').seedMilestones(user, callback);
        },
        function(callback){
            return require('./seed-data/seed-data.status-setup.server.controller.js').seedStatuses(user, callback);
        },
        function(callback){
            return require('./seed-data/seed-data.process-setup.server.controller.js').seedProcesses(user, callback);
        },
        function(callback){
            return require('./seed-data/seed-data.portfolio-setup.server.controller.js').seedPortfolioSetup(user, callback);
        },
        function(callback){
            return require('./seed-data/seed-data.strategy-setup.server.controller.js').seedStrategySetup(user, callback);
        }
    ], function(err, results) {
        if (err) {
            callback(err);
        } else {
            callback(null, results);
        }
    });
};

var loadTrees = function (user, callback) {
    async.parallel([
        function(callback){
            return require('./seed-data/seed-data.strategy-tree.server.controller.js').seedStrategyTree(user, callback);
        },
        function(callback){
            return require('./seed-data/seed-data.portfolio-tree.server.controller.js').seedPortfolioTree(user, callback);
        }
    ], function(err, results) {
        if (err) {
            callback(err);
        } else {
            callback(null, results);
        }
    });
};

var loadProjects = function (user, callback) {
    async.parallel([
        function(callback){
            return require('./seed-data/seed-data.financial-costs.server.controller.js').seedFinancialCosts(user, callback);
        },
        function(callback){
            return require('./seed-data/seed-data.financial-benefits.server.controller.js').seedFinancialBenefits(user, callback);
        },
        function(callback){
            return require('./seed-data/seed-data.project-identification.server.controller.js').seedProjects(user, callback);
        }
    ], function(err, results) {
        if (err) {
            callback(err);
        } else {
            callback(null, results);
        }
    });
};

exports.loadSetupData = loadSetupData;

exports.loadTrees = loadTrees;

exports.loadProjects = loadProjects;

exports.seed = function(req, res) {
    async.series([
        // 1) Create all seed setup data straight into the database
        function(callback){
            return loadSetupData(req.user, callback);
        },
        // 2) Create portfolio and strategy structure
        function(callback){
            return loadTrees(req.user, callback);
        },
        // 3) Create projects
        function(callback){
            return loadProjects(req.user, callback);
        }
    ], function(err, results){
        if (err) {
            console.log(err);
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(results);
        }
    });

};
