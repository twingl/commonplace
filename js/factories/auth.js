( function() {
  'use strict';

  window.Commonplace = window.Commonplace || {};

  //TODO This is a very early hack - it needs to check for token validity and
  //retrieve a new token if the current one is invalid/expired
  Commonplace.app.factory('$auth', ['$q', '$cookieStore', function($q, $cookieStore) {
    var Auth = {
      authenticate: function() {
        var deferred = $q.defer();
        var token = $cookieStore.get('token');

        if (token) {
          deferred.resolve(token);
        } else {
          OAuth.initialize('vriVw-S06p3A34LnSbGoZ2p0Fhw');
          OAuth.popup('twingl', function(error, result) {
            if (error) {
              deferred.reject(error);
            } else {
              $cookieStore.put('token', result);
              deferred.resolve(result);
            }
          });
        }

        return deferred.promise;
      },

      clearAuthentication: function() {
        $cookieStore.remove('token');
      }
    };

    return Auth;
  }]);

})();
