'use strict';

angular.module('myappApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('group', {
        url: '/group',
        templateUrl: 'app/group/group.html',
        controller: 'GroupCtrl',
        resolve: {
            groups: function(groupFactory){
                // query : tableau de resource, get : resource spécifique
                return groupFactory.query().$promise;
            }
        }
      });
  });