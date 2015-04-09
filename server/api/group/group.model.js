'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var User=require('../user/user.model');

var GroupSchema = new Schema({
  __creator: {type: Schema.ObjectId, ref: "User"},
  name: String,
  info: {type: String, default: "infos group"},
  active: Boolean,
  users: [{type: Schema.ObjectId, ref: "User"}]
});

GroupSchema
    .virtual('emails')
    .set(function(emails){
        var self=this;
        for(var i=0; i<emails.length; i++){
            User.findOne({email: emails[i]}, {}, function(err, user){
                if(!user){
                    console.log('userId non trouvé');
                }else{
                    self.users.push(user._id);
                    self.save();
                    //console.log(user);
                }
            });
        }
    });
module.exports = mongoose.model('Group', GroupSchema);