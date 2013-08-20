( function() {
  'use strict';

  Commonplace.app.config(['$routeProvider', function($routeProvider) {

    $routeProvider.when( '/', {
      templateUrl: Commonplace.templates.index,
      controller: 'IndexController'
    });

  }]);

})();
