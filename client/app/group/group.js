'use strict';

angular.module('myappApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('group', {
        url: '/group',
        templateUrl: 'app/group/group.html',
        controller: 'GroupCtrl',
        resolve: {
            groups: function(groupFactory, Auth){
                var user=Auth.getCurrentUser();
                // query : tableau de resource, get : resource spécifique
                return groupFactory.query({userId: user._id}).$promise;
            }
        }
      })
      .state('group_new', {
        url: '/group/new',
        templateUrl: 'app/group/group_add.html',
        controller: function($scope, groupFactory, Auth){
            $scope.groupAdd=function(form){
                console.log(form.group_name);
            };
        }
    });
        
  });