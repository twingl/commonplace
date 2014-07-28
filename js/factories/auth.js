( function() {
  'use strict';

  window.Commonplace = window.Commonplace || {};

  /*
   * TODO This is an early version - it needs to check for token
   *      validity and retrieve a new token if the current one is
   *      invalid/expired
   */
  Commonplace.app.factory('Auth', ['$q', '$http', '$timeout', function($q, $http, $timeout) {
    jso_configure({
      "twingl": {
        client_id: "d8e24199a67bee4088392f65bf377d1c17f963887fc0afeb294f168d41c99815",
        redirect_uri: "http://commonplace.twin.gl/sign_in.html",
        authorization: "https://api.twin.gl/oauth/authorize"
      }
    });

    var Auth = {

      token: function() {
        return { access_token: jso_getToken("twingl") };
      },

      authenticate: function() {
        jso_ensureTokens({ "twingl": false });

        var deferred = $q.defer();
        var token = jso_getToken("twingl");
        console.log(token);

        if (token) {
          deferred.resolve(token);
        } else {
          deferred.reject();
        }

        return deferred.promise;
      },

      isAuthenticated: function() {
        return (jso_getToken("twingl"))
      },

      clearAuthentication: function() {
        // invalidate token
        $http.post("https://api.twin.gl/oauth/revoke", { token: jso_getToken("twingl") });
        localStorage.removeItem("tokens-twingl");
      }
    };

    return Auth;
  }]);

})();
