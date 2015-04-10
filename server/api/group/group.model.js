'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var User=require('../user/user.model');

var GroupSchema = new Schema({
  __creator: {type: Schema.ObjectId, ref: "User"},
  name: String,
  info: {type: String, default: "infos group"},
  active: Boolean,
  users: [{type: Schema.ObjectId, ref: "User"}],
  invitations: []
});

GroupSchema
.pre('save', function(next){
    var self=this;
    User.find().where('email').in(self.invitations).exec(function(err, users){
        self.users=users;
        self.users.push(self.__creator);
        next();
    });
});
module.exports = mongoose.model('Group', GroupSchema);