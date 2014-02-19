( function() {
  'use strict';

  window.Commonplace = window.Commonplace || {};

  Commonplace.app = angular.module( 'Commonplace', [
    'factories',
    'filters',
    'controllers',
    'directives',
    'services',
    'ngCookies'
  ]);

  Commonplace.factories   = angular.module('factories',   []);
  Commonplace.filters     = angular.module('filters',     []);
  Commonplace.controllers = angular.module('controllers', []);
  Commonplace.directives  = angular.module('directives',  []);
  Commonplace.services    = angular.module('services',    []);

})();
