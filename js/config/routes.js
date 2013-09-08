( function() {
  'use strict';

  Commonplace.app.config(['$routeProvider', function($routeProvider) {

    $routeProvider

      .when( '/highlights/:highlight_id', {
        templateUrl: Commonplace.templates.highlights,
        controller: 'HighlightController'
      })

      .when( '/twinglings', {
        templateUrl: Commonplace.templates.twinglings,
        controller: 'TwinglingController'
      })

      .when( '/sign_in', {
        templateUrl: Commonplace.templates.signIn,
        controller: 'AuthenticationController'
      })

      .when( '/:date', {
        templateUrl: Commonplace.templates.index,
        controller: 'IndexController'
      })

      .otherwise ({
        redirectTo: '/'
      });

  }]);


  Commonplace.app.run(['$rootScope', '$location', 'Auth', '$http', function ($rootScope, $location, Auth, $http) {

    $rootScope.$on("$routeChangeStart", function (event, next, current) {
      if (!Auth.isAuthenticated()) {
        // Clear the Authorization header & redirect
        $http.defaults.headers.common['Authorization'] = undefined;
        $location.path('/sign_in');
      } else {
        // Make sure the Authorization header is set
        $http.defaults.headers.common['Authorization'] = 'Bearer '+ Auth.token().access_token;
      }
    });

  }]);

})();
