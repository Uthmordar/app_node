'use strict';

angular.module('myappApp')
    .factory('groupFactory', function ($resource){
        return $resource('/api/groups/user/:userId/:groupId', {userId: '@userId', groupId: '@id'});
    });
