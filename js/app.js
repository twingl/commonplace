( function() {
  'use strict';

  window.Donna = window.Donna || {};

  Donna.app = angular.module( 'donna', [
    'factories',
    'filters',
    'controllers',
    'directives'
  ]);

  Donna.factories   = angular.module('factories',   []);
  Donna.filters     = angular.module('filters',     []);
  Donna.controllers = angular.module('controllers', []);
  Donna.directives  = angular.module('directives',  []);

})();
