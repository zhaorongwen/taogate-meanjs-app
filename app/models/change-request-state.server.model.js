'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;
require('mongoose-multitenant');

/**
 * Change request state Schema
 */
var ChangeRequestStateSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill Change request state name',
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

mongoose.mtModel('ChangeRequestState', ChangeRequestStateSchema);
