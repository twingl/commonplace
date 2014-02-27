( function() {
  'use strict';

  Commonplace.filters.filter('CleanedURL', function() {

    return function(input) {
      var cleanedURL = input.replace('http://','').replace('https://','').replace('www.','').replace(/\/+$/,'').split(/[?#]/)[0];
      return cleanedURL;
    };

  });

})();