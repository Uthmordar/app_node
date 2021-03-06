'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');
var userFixture = require('../user/user.fixtures');
var User=require('../user/user.model');
var Group = require('./group.model');
var async=require('async');
var io=require('socket.io-client');
var options={
    transports: ['websocket'],
    'force new connection': true,
    path: '/socket.io-client'
};

var users, token, group, data;

var checkMessage=function(user, callback){
    var tag='group_'+user._id+':save';
    user.client.on(tag, function(msg){
        data.__creator.toString().should.be.equal(msg.__creator);
        data.name.should.be.equal(msg.name);
        user.client.disconnect();
        return callback(null);
    });
};
var checkMessages=function(done){
    async.parallel([
        function(callback){
            checkMessage(users[0], callback);
        },
        function(callback){
            checkMessage(users[1], callback);
        }
    ], function(err, result){
        done(err);
    });
};
            
function connectUser(user, callback){
    user.client= io.connect('http://localhost:9000', options)
    .on('connect', function(a, b){
        return callback(null, user);
    })
    .on('connect_error', function(err, b){
        return callback(err);
    })
    .on('connect_timeout', function(err, b){
        return callback(err);
    });
}

function connectUsers(done){
    async.parallel([
        function(callback){
            connectUser(users[0], callback);
        },
        function(callback){
            connectUser(users[1], callback);
        }
    ],
    function(err, result){/*return done(err);*/}
    );  
}

describe('POST /api/groups', function(){
    before(function(done) { 
        userFixture.createUsers(done);
        users = userFixture.getUsers();
    });
    
    it('should respond with correct JSON object', function(done){
        users = userFixture.getUsers();
        request(app)
        .post('/auth/local')
        .send({ email: users[0].email, password: users[0].password })
        .expect(200)
        .end(function(err, res) {
            if(err) throw err;
            token=res.body.token;
            request(app)
            .post('/api/groups')
            .send({name: 'test', invitations: ['toto@mail.com', users[1].email]})
            .set('Authorization', 'Bearer '+ token)
            .expect(201)
            .expect('Content-Type', /json/)
            .end(function(err, res){
                if(err) return done(err);
                res.body.should.be.instanceof(Object);
                res.body.name.should.be.equal('test');
                res.body.invitations[0].should.be.equal('toto@mail.com');
                async.parallel([
                    function(callback){
                        User.findOne({_id: res.body.users[0]}, function(err, user){
                            if(err) return done(err);
                            should.exist(user, 'user not found in database');
                            callback(null, user);
                        });
                    },
                    function(callback){
                        User.findOne({_id: res.body.users[1]}, function(err, user){
                            if(err) return done(err);
                            should.exist(user, 'creator not found in database');
                            callback(null, user);
                        });
                    }
                ], function(err, result){
                    group=res.body;
                    done(err);
                });
            });
        });
    });
    
    it('should respond with 401', function(done){
        request(app)
        .post('/api/groups')
        .send({name: 'test'})
        .expect(401)
        .end(function(err, res){
            if(err) return done(err);
            done();
        });
    });
});

describe('GET /api/groups', function() {
  it('should respond with JSON array', function(done) {
    request(app)
    .post('/auth/local')
    .send({ email: users[0].email, password: users[0].password })
    .expect(200)
    .end(function(err, res) {
      if ( err ) throw err;
      request(app)
      .get('/api/groups')
      .set('Authorization', 'Bearer ' + res.body.token)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Array);
        done();
      });
    });
  });

  it('should respond with 401', function(done) {

      request(app)
      .get('/api/groups')
      .expect(401)
      .end(function(err, res) {
        if (err) return done(err);
        done();
      });
  });
});

describe('DELETE /api/groups/nnn', function(){
    
    it('should delete user from group users', function(done){
        request(app)
        .post('/auth/local')
        .send({ email: users[0].email, password: users[0].password })
        .expect(200)
        .end(function(err, res) {
            if(err) throw err;
            request(app)
            .delete('/api/groups/'+group._id)
            .set('Authorization', 'Bearer ' + res.body.token)
            .expect(204)
            .end(function(err, res){
                if(err) return done(err);
                Group.findOne({_id:group._id}, function(err, group2){
                    if(err) return done(err, 'Group non trouvé');
                    var index=group2.invitations.indexOf(users[0].email);
                    index.should.be.equal(-1, 'User still in invitations');
                    index=group2.users.indexOf(users[0]._id);

                    index.should.be.equal(-1, 'User still in group');
                    group=group2;
                });
                done();
            });
        });
    });
});

describe('POST /api/groups/nnn/email', function(){    
    it('should respond with 401 of not the creator', function(done){
        request(app)
        .post('/auth/local')
        .send({ email: users[1].email, password: users[1].password })
        .expect(200)
        .end(function(err, res){
            if(err) throw err;
            request(app)
            .post('/api/groups/'+group._id+'/email')
            .send({emails: ["titi@mail.com"]})
            .set('Authorization', 'Bearer ' + res.body.token)
            .expect(403)
            .end(function(err, res){
                if(err) return done(err);
                done();
            });
        });
    });
    
    it('should respond with error if no emails', function(done){
        request(app)
        .post('/auth/local')
        .send({ email: users[0].email, password: users[0].password })
        .expect(200)
        .end(function(err, res){
            if(err) throw err;
            request(app)
            .post('/api/groups/'+group._id+'/email')
            .set('Authorization', 'Bearer ' + res.body.token)
            .expect(422)
            .end(function(err, res){
                if(err) return done(err);
                done();
            });
        });
    });
    
    it('should respond with no error', function(done){
        request(app)
        .post('/auth/local')
        .send({ email: users[0].email, password: users[0].password })
        .expect(200)
        .end(function(err, res){
            if(err) throw err;
            request(app)
            .post('/api/groups/'+group._id+'/email')
            .send({emails: ["titi@mail.com", "admin@admin.com", users[1].email]})
            .set('Authorization', 'Bearer ' + res.body.token)
            .expect(200)
            .end(function(err, res){
                if(err) return done(err);
                Group.findOne({_id:group._id}, function(err, group2){
                    group2.invitations.length.should.be.equal(2, 'wrong emails quantity');
                    group2.users.length.should.be.equal(2);
                });
                done();
            });
        });
    });
    
    it('should send new group by socketio to group subscriber users', function(done){
        connectUsers(done); 
        data={
            __creator: users[0]._id,
            name: 'test test',
            invitations: ['toto@mail.com', users[1].email]
        };
        request(app)
        .post('/auth/local')
        .send({ email: users[0].email, password: users[0].password })
        .expect(200)
        .end(function(err, res){
            checkMessages(done);
            Group.create(data, function(err, group3){
                if(err) done(err);
            });
            /*var checkMessage=function(client, user){
                var tag='group_'+user._id+':save';
                client.on(tag, function(msg){
                    data.__creator.toString().should.be.equal(msg.__creator);
                    data.name.should.be.equal(msg.name);
                    client.disconnect();
                    done();
                });
            };

            var client1, client2;

            client1=io.connect('http://localhost:9000', options);
            client1.on('connect', function(a, b){
                checkMessage(client1);
                Group.create(data, function(err, group3){
                    if(err) done(err);
                });
            })
            .on('connect_error', function(err, b){
                done(err);
            })
            .on('connect_timeout', function(err, b){
                done(err);
            });*/
        });
    });
});

describe('User.create', function(){
    before(function(done){
        User.findOne({email: 'toto@mail.com'}, function(err, user){
            if(err) return done(err);
            if (!user) return done();
            user.remove(function(err, user){
                done(err);
            });
        });
    });
    it('should update group where user is email subscriber', function(done){
        var data={
           __creator: users[0]._id,
           name: 'adzada',
           emails: ['toto@mail.com']
        };
        
        Group.create(data, function(err, group){
            if(err) done(err);
            userFixture.createUser('toto@mail.com', function(err, user){
                group.invitations.indexOf(user.email).should.be.equal(-1);
                done();
            });
        });
    });
});