( function() {
  'use strict';

  Commonplace.app.config(['$routeProvider', function($routeProvider) {

    $routeProvider.when( '/', {
      templateUrl: Commonplace.templates.index,
      controller: 'IndexController'
    });

    $routeProvider.when( '/twinglings', {
      templateUrl: Commonplace.templates.twinglings,
      controller: 'TwinglingController'
    });

  }]);

})();
