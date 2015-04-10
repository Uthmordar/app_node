'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var MessageSchema = new Schema({
    __creator: {type: Schema.ObjectId, ref: "User"},
    content: String,
    content_type: {type: String, default: "text"},
    creation_date: {type: Date, default: Date.now},
    group: {type: Schema.ObjectId, ref: "Group"}
});

module.exports = mongoose.model('Message', MessageSchema);