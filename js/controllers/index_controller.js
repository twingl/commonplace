( function() {
  'use strict';

  Donna.controllers.controller( 'IndexController', ['$scope', '$http', function($scope, $http) {
    OAuth.initialize('Your twingl OAuth.io token');

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
      }
    });

    console.log("Hello world!");
  }]);

})();
