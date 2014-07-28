( function() {
  'use strict';

  Commonplace.controllers.controller( 'AuthenticationController', ['$scope', 'Auth', '$route', '$location', function($scope, Auth, $route, $location) {

    $scope.loadingState      = false;
    $scope.loadingStateClass = '';

    $scope.$watch('loadingState', function(newVal, oldVal) {
      $scope.loadingStateClass = (newVal) ? 'show' : '';
    });

    // probably not the right place for this, but yolo (another thing to fix)
    $scope.newUser      = false;
    $scope.newUserMsgClass = '';

    $scope.$watch('newUser', function(newVal, oldVal) {
      $scope.newUserMsgClass = (newVal) ? 'show' : '';
    });

    $scope.signIn = function() {
      Auth.authenticate().then(
        function(token) { //success
          $location.path('/'); // Go on over to the real app
        },
        function(error) { //error
          $location.path('/sign_in.html');
        }
      );
    };

    $scope.signOut = function() {
      Auth.clearAuthentication();
      $location.path('/sign_in');
    };

  }]);

})();
