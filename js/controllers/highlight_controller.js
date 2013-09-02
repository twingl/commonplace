(function() {
  'use strict';

  Commonplace.controllers.controller('HighlightController', ['$auth', '$scope', '$http', '$routeParams', '$filter', '$location', function($auth, $scope, $http, $routeParams, $filter, $location) {
    $auth.authenticate().then(
      function(token) { //success
        window.access_token = token;
        $http.defaults.headers.common['Authorization'] = 'Bearer '+token.access_token;

        $http.get('http://api.twin.gl/v1/users/me')
             .success( function(data, status, headers, config) {
               console.log(data, status, headers, config);
             });
        console.log("Access token:", token);
        /* END CONFIGURATION STUFF */

        $scope.highlight = {};
        $scope.twinglings = [];
        $scope.highlights = [];

        // pulls the current user's selecyed highlight
        $http.get('http://api.twin.gl/v1/highlights/' + $routeParams.highlight_id + '?expand=comments,twinglings').success(
            function(highlight) {
              $scope.highlight = highlight;

              //remove current highlight from twingling pair
              if (highlight.twinglings.length !== 0) {
                for (var i = 0; i <= $scope.highlight.twinglings.length - 1; i++) {
                  var end_object_id = $scope.highlight.twinglings[i].end_id;
                  var twingledHighlightId = "";
                  var twingledHighlightObject = {};

                  if (end_object_id !== $scope.highlight.id) {
                    twingledHighlightId = end_object_id;
                    //pull twingled highlight's comments
                  }
                  else {
                    twingledHighlightId = $scope.highlight.twinglings[i].start_id;
                    //pull twingled highlight's comments
                  }

                  $http.get('http://api.twin.gl/v1/highlights/' + twingledHighlightId + '?expand=comments').success(
                  function(twingledHighlight) {
                          twingledHighlightObject = twingledHighlight;
                          $scope.twinglings.push(twingledHighlightObject);
                        });
                };
              }

              //pulls other highlights from that article
              $http.get('http://api.twin.gl/v1/highlights?context=' + $scope.highlight.context_url + '&;expand=comments').success(
                    function(highlights) {
                      var temp = highlights;
                      for (var i = 0; i < temp.length; i++) {
                        if (temp[i].id === $scope.highlight.id) {
                          temp.splice(i,1);
                          break;
                        }
                      };
                      $scope.highlights = temp;
                    });
            });
      },
      function(error) { //error
        console.log("There was a problem!", error);
      });

    //jump-to-page
    $scope.navigateTo = function (date) {
      var dateFormatted = $filter('date')(date, 'yyyy-MM-dd');
      $location.path('/' + dateFormatted);
    };

  }]);

})();
