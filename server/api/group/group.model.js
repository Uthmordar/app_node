'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

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
    var self=this;
    User.find().where('email').in(self.invitations).exec(function(err, users){
        self.users=users;
        self.users.push(self.__creator);
        next();
    });
});

GroupSchema.methods={
    removeUser: function(user, callback){
        console.log(user);
        /*var index=this.emails.indexOf(user.email);
        if(index>-1) this.emails.splice(index, 1);*/
        
        var index=this.users.indexOf(user._id);
        if(index>-1) this.users.splice(index, 1);
        
        this.save(function(err){
            return callback(err);
        });
    }
};
module.exports = mongoose.model('Group', GroupSchema);