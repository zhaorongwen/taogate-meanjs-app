'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	PortfolioChangeRequest = mongoose.model('PortfolioChangeRequest');

/**
 * Globals
 */
var user, portfolioChangeRequest;

/**
 * Unit tests
 */
describe('Portfolio change request Model Unit Tests:', function() {
	beforeEach(function(done) {
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: 'username',
			password: 'password'
		});

		user.save(function() { 
			portfolioChangeRequest = new PortfolioChangeRequest({
				name: 'Portfolio change request Name',
				user: user
			});

			done();
		});
	});

	describe('Method Save', function() {
		it('should be able to save without problems', function(done) {
			return portfolioChangeRequest.save(function(err) {
				should.not.exist(err);
				done();
			});
		});

		it('should be able to show an error when try to save without name', function(done) { 
			portfolioChangeRequest.name = '';

			return portfolioChangeRequest.save(function(err) {
				should.exist(err);
				done();
			});
		});
	});

	afterEach(function(done) { 
		PortfolioChangeRequest.remove().exec();
		User.remove().exec();

		done();
	});
});