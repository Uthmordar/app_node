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
                    return groupFactory.query({}).$promise;
                }
            }
        })
        .state('group_new', {
            url: '/group/new',
            templateUrl: 'app/group/group_add.html',
            controller: function($scope, groupFactory, $state){
            
                $scope.groupAdd=function(form){
                    groupFactory.save({name: form.group_name, invitations: form.emails}).$promise
                    .then(function(){
                        $state.go('group');
                    });
                };
            }
        })
        .state('group_show', {
            url: '/group/:id',
            templateUrl: "app/group/group_show.html",
            controller: function($scope, $state, messageFactory, group, messages, socket){
                $scope.group=group[0];
                $scope.messages=messages;
                socket.syncUpdates('group_'+$scope.group._id, $scope.messages);
                
                $scope.messageAdd=function(form){
                    messageFactory.save({content: form.message, group: $scope.group._id});
                    form.message='';
                };
            },
            resolve: {
                group: function(groupFactory, $stateParams){
                    return groupFactory.query({id: $stateParams.id}).$promise;
                },
                messages: function(messageFactory, $stateParams){
                    return messageFactory.query({groupId: $stateParams.id}).$promise;
                }
            }
            
        });
    });      