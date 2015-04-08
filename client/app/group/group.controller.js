'use strict';

angular.module('myappApp')
  .controller('GroupCtrl', function ($scope, groups) {
    $scope.message = 'Hello';
    $scope.groups=groups;
  });
