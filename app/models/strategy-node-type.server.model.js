'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
require('mongoose-multitenant');

/**
 * Strategy node type Schema
 */

var StrategyNodeTypeSchema = new Schema({
    name: {
        type: String,
        default: '',
        required: 'Please fill type name',
        trim: true
    },
    description:{
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

mongoose.mtModel('StrategyNodeType', StrategyNodeTypeSchema);
