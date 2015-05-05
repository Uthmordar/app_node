'use strict';

angular.module('myappApp')
  .controller('GroupCtrl', function ($scope, Auth, socket, groups) {
    $scope.message = 'Hello';
    $scope.groups=groups;
    socket.syncUpdates('group_'+Auth.getCurrentUser()._id, $scope.groups);
    $scope.$on('$destroy', function(){
        socket.unsyncUpdates('group_'+Auth.getCurrentUser()._id);
    });
  });
