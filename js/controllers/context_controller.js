( function() {
  'use strict';

  Commonplace.controllers.controller('ContextController', ['$scope', '$http', '$filter', function($scope, $http, $filter) {

    // Global variable
    $scope.contexts = [];

    // Pulls a list of the user's contexts
    $http.get('http://api.twin.gl/v1/contexts/mine')
      .success(function(data) {
        $scope.contexts = data;   
      })
      .error(function(data) { 
        console.log(data);
      });

  }]);
})();
