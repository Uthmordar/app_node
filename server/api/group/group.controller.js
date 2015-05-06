'use strict';

var _ = require('lodash');
var Group = require('./group.model');

// Get list of groups
exports.index = function(req, res) {
  Group.find({users: req.user._id}, function (err, groups) {
    if(err) { return handleError(res, err); }
    return res.json(200, groups);
  });
};

// Get a single group
exports.show = function(req, res) {
  Group.findById(req.params.id, function (err, group) {
    if(err) { return handleError(res, err); }
    if(!group) { return res.send(404); }
    return res.json(group);
  });
};

// Creates a new group in the DB.
exports.create = function(req, res) {
    req.body.__creator=req.user._id;
  Group.create(req.body, function(err, group) {
    if(err) { return handleError(res, err); }
    return res.json(201, group);
  });
};

// Updates an existing group in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Group.findById(req.params.id, function (err, group) {
    if (err) { return handleError(res, err); }
    if(!group) { return res.send(404); }
    var updated = _.merge(group, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, group);
    });
  });
};

exports.addEmail= function(req, res){
    Group.findById(req.params.id, function(err, group){
        if(err){ return handleError(res, err);}
        if(!group){ return res.send(404);}
        if(group.__creator !== req.user._id){
            return res.send(403, new Error('Only creator can do this'));
        }
        group.addEmails(req.params.email, function(err){
            if(err){ return handleError(res, err);}
                return res.json(204);
        });
    });
};

// Deletes a group from the DB.
exports.destroy = function(req, res) {
  Group.findById(req.params.id, function (err, group) {
    if(err) { return handleError(res, err); }
    if(!group) { return res.send(404); }
    group.removeUser(req.user, function(err) {
        if(err) { return handleError(res, err); }
            return res.send(204);
        });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}