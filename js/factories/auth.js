( function() {
  'use strict';

  window.Commonplace = window.Commonplace || {};

  /*
   * TODO This is an early version - it needs to check for token
   *      validity and retrieve a new token if the current one is
   *      invalid/expired
   */
  Commonplace.app.factory('Auth', ['$q', '$cookieStore', '$timeout', function($q, $cookieStore, $timeout) {
    var TOKEN_KEY    = 'token',
        POPUP_TITLE  = 'twingl',
        OAUTHD_TOKEN = 'vriVw-S06p3A34LnSbGoZ2p0Fhw';

    var Auth = {

      token: function() {
        return $cookieStore.get(TOKEN_KEY);
      },

      authenticate: function() {
        var deferred = $q.defer();
        var token = $cookieStore.get(TOKEN_KEY);

        if (token) {
          deferred.resolve(token);
        } else {
          OAuth.initialize(OAUTHD_TOKEN);
          OAuth.popup(POPUP_TITLE, function(error, result) {
            if (error) {
              deferred.reject(error);
            } else {
              $cookieStore.put(TOKEN_KEY, result);
              deferred.resolve(result);
            }
            $timeout(function() {}, 50); // Trigger a new $digest cycle
          });
        }

        return deferred.promise;
      },

      isAuthenticated: function() {
        return ($cookieStore.get(TOKEN_KEY) != undefined)
      },

      clearAuthentication: function() {
        $cookieStore.remove(TOKEN_KEY);
      }
    };

    return Auth;
  }]);

})();
