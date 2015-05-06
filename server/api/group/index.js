'use strict';

var express = require('express');
var controller = require('./group.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.isAuthenticated(), controller.index);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.post('/', auth.isAuthenticated(), controller.create);
router.put('/:id', controller.update);
//router.post('/:id/users/:user_id', auth.isAuthenticated(), controller.addUser);
router.post('/:id/email', auth.isAuthenticated(), controller.addEmail);
router.patch('/:id', controller.update);
router.delete('/:id', auth.isAuthenticated(), controller.destroy);

module.exports = router;