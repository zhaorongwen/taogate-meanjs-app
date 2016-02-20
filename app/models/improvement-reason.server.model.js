'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;
require('mongoose-multitenant');


/**
 * Improvement reason Schema
 */
var ImprovementReasonSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill Improvement reason name',
		trim: true
	},
	description: {
		type: String,
		default: '',
		trim: true
	},
	created: {
		type: Date,
		default: Date.now
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	}
});

mongoose.mtModel('ImprovementReason', ImprovementReasonSchema);
