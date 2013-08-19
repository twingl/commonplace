( function() {
  'use strict';

  Donna.app.config(['$routeProvider', function($routeProvider) {

    $routeProvider.when( '/', {
      templateUrl: Donna.templates.index,
      controller: 'IndexController'
    });

  }]);

})();
