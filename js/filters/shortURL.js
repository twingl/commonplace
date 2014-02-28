( function() {
  'use strict';

  Commonplace.filters.filter('ShortURL', function() {

    return function(input) {
      if (input.length > 60) {
        var shortURL = input.substring(0,50) + "...";
      }
      return shortURL;
    };

  });

})();