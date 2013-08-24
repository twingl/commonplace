( function() {
  'use strict';

  Commonplace.app.config(['$routeProvider', function($routeProvider) {

    $routeProvider.when( '/:date', {
      templateUrl: Commonplace.templates.index,
      controller: 'IndexController'
    });

    $routeProvider.when( '/highlights/:highlight_id', {
      templateUrl: Commonplace.templates.highlights,
      controller: 'HighlightController'
    });

    $routeProvider.when( '/twinglings', {
      templateUrl: Commonplace.templates.twinglings,
      controller: 'TwinglingController'
    });

  }]);

})();
