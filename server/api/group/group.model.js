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
  invitations: [{type: String}]
});

GroupSchema
    .virtual('emails')
    .set(function(emails){
        var self=this, mail;

        for(var i=0; i<emails.length; i++){
            mail=emails[i];
            User.findOne({email: mail}, {}, function(err, user){
                if(!user){
                    self.invitations.push(mail);
                    console.log('userId non trouvé');
                }else{
                    self.users.push(user._id);
                    //self.__creator;
                }
            });
        }
        self.save();
    });
module.exports = mongoose.model('Group', GroupSchema);