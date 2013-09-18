( function() {
  'use strict';

  Commonplace.controllers.controller( 'AuthenticationController', ['$scope', 'Auth', '$route', '$location', function($scope, Auth, $route, $location) {

    $scope.loadingState      = false;
    $scope.loadingStateClass = '';

    $scope.$watch('loadingState', function(newVal, oldVal) {
      $scope.loadingStateClass = (newVal) ? 'show' : '';
    });

    $scope.signIn = function() {
      Auth.authenticate().then(
        function(token) { //success
          $location.path('/'); // Go on over to the real app
        },
        function(error) { //error
          console.log("There was an error with the authing process");
        }
      );
    };

    $scope.signOut = function() {
      Auth.clearAuthentication();
      $location.path('/sign_in');
    };

  }]);

})();
