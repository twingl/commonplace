( function() {
  'use strict';

  Commonplace.filters.filter('ShortenedURL', function() {

    return function(input) {
      var shortURL = input.replace('http://','').replace('https://','').replace('www.','').replace(/\/+$/,'').split(/[?#]/)[0];
      return shortURL;
    };

  });

})();