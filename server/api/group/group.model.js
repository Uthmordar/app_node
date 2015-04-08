'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var GroupSchema = new Schema({
  __creator: {type: Schema.ObjectId, ref: "User"},
  name: String,
  info: String,
  active: Boolean
});

module.exports = mongoose.model('Group', GroupSchema);