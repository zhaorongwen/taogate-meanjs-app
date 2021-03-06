'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	PeopleProjectRole = mongoose.model('PeopleProjectRole');

/**
 * Globals
 */
var user, peopleProjectRole;

/**
 * Unit tests
 */
describe('People project role Model Unit Tests:', function() {
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
			peopleProjectRole = new PeopleProjectRole({
				name: 'People project role Name',
				user: user
			});

			done();
		});
	});

	describe('Method Save', function() {
		it('should be able to save without problems', function(done) {
			return peopleProjectRole.save(function(err) {
				should.not.exist(err);
				done();
			});
		});

		it('should be able to show an error when try to save without name', function(done) { 
			peopleProjectRole.name = '';

			return peopleProjectRole.save(function(err) {
				should.exist(err);
				done();
			});
		});
	});

	afterEach(function(done) { 
		PeopleProjectRole.remove().exec();
		User.remove().exec();

		done();
	});
});