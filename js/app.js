( function() {
  'use strict';

  window.Commonplace = window.Commonplace || {};

  Commonplace.app = angular.module( 'Commonplace', [
    'factories',
    'filters',
    'controllers',
    'directives',
    'wu.masonry',
    'ngCookies',
    'ui.keypress'
  ]);

  Commonplace.factories   = angular.module('factories',   []);
  Commonplace.filters     = angular.module('filters',     []);
  Commonplace.controllers = angular.module('controllers', []);
  Commonplace.directives  = angular.module('directives',  []);

})();
