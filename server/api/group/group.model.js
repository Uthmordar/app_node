'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    _ = require('lodash');;

var User=require('../user/user.model');

var GroupSchema = new Schema({
  __creator: {type: Schema.ObjectId, ref: "User", index: true},
  name: {type: String, required: true},
  info: {type: String, default: "infos group"},
  active: Boolean,
  users: [{type: Schema.ObjectId, ref: "User", index: true}],
  invitations: []
});

GroupSchema
.pre('save', function(next){    
    this.invitations=_.uniq(this.invitations);
    var self=this;
    User.find().where('email').in(self.invitations).exec(function(err, users){
        self.users=_.uniq(_.union(users, self.users));
        
        if(self.isNew){
            var index=self.users.indexOf(self.__creator);
            if(index===-1) self.users.push(self.__creator);
        }
        var usersEmails = _.pluck(users, 'email');
        self.invitations = _.difference(self.invitations, usersEmails);
        next();
    });
});

GroupSchema.methods={
    addEmails: function(emails, callback){
      if(!emails) throw(new Error('No emails given'));
      this.invitations=_.union(this.invitations, emails);
      this.save(function(err, data){
          if(err) throw(err);
          return callback(err);
      });
    },
    removeUser: function(user, callback){
        /*var index=this.invitations.indexOf(user.email);
        if(index>-1) this.invitations.splice(index, 1);*/

        var index=this.users.indexOf(user._id);
        if(index>-1) this.users.splice(index, 1);
        
        if(this.invitations.length || this.users.length){
            this.save(function(err){
                return callback(err);
            });
        }else{
            this.remove(function(err){
                return callback(err);
            });
        }
    }
};
module.exports = mongoose.model('Group', GroupSchema);