( function() {
  'use strict';

  Commonplace.controllers.controller( 'IndexController', ['$scope', '$http', function($scope, $http) {
    OAuth.initialize('vriVw-S06p3A34LnSbGoZ2p0Fhw');

    //Using popup (option 1)
    OAuth.popup('twingl', function(error, result) {
      //handle error with error
      //use result.access_token in your API request
      if (error) {
        console.log("There was a problem!");
      } else {
        window.access_token = result;
        $http.defaults.headers.common['Authorization'] = 'Bearer '+result.access_token;

        $http.get('http://api.twin.gl/flux/users/me')
             .success( function(data, status, headers, config) {
               console.log(data, status, headers, config);
             });
        console.log("Access token:", result);

        $scope.highlights = [];

        $http.get('http://api.twin.gl/flux/highlights?context=twingl://mine').success(
            function(data) {
              $scope.highlights = data;
              console.log(data)
            }
          );

        // removes a highlight from the API, but doesn't update the DOM
        $scope.deleteHighlight = function(id) {
          console.log(id);
          $http.delete('http://api.twin.gl/flux/highlights/' + id).success(
            function(data) {
              console.log(data);
          })
        }

      }
    });

  }]);

})();
