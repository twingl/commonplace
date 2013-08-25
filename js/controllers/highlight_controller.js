(function() {
  'use strict';

  Commonplace.controllers.controller('HighlightController', ['$scope', '$http', '$routeParams', '$filter', '$location', function($scope, $http, $routeParams, $filter, $location) {
    OAuth.initialize('vriVw-S06p3A34LnSbGoZ2p0Fhw');

    //Using popup (option 1)
    OAuth.popup('twingl', function(error, result) {
      //handle error with error
      //use result.access_token in your API request
      if (error) {
        console.log("There was a problem!");
      } else {
        window.access_token = result;
        $http.defaults.headers.common['Authorization'] = 'Bearer '+result.access_token;

        $http.get('http://api.twin.gl/flux/users/me')
             .success( function(data, status, headers, config) {
               console.log(data, status, headers, config);
             });
        console.log("Access token:", result);
        /* END CONFIGURATION STUFF */

        $scope.highlight = {};
        $scope.twinglings = [];

        // pulls all the current user's highlights
        $http.get('http://api.twin.gl/flux/highlights/' + $routeParams.highlight_id + '?expand=comments,twinglings').success(
            function(data) {
              $scope.highlight = data;
              console.log(data);

              //remove current highlight from twingling pair
              if ($scope.highlight.twinglings.length !== 0) {
                for (var i = 0; i <= $scope.highlight.twinglings.length - 1; i++) {
                  var end_object_id = $scope.highlight.twinglings[i].end_id;
                  var twingledHighlightObject = {};

                  if (end_object_id !== $scope.highlight.id) {
                    twingledHighlightObject = $scope.highlight.twinglings[i].end_object;
                  }
                  else {
                    twingledHighlightObject = $scope.highlight.twinglings[i].start_object;
                  }

                  //pull twingled highlight's comments
                  $http.get('http://api.twin.gl/flux/highlights/' + twingledHighlightObject.id + '/comments').success(
            function(comments) {
                    twingledHighlightObject.comments = comments;
                  });

                  $scope.twinglings.push(twingledHighlightObject);
                };
              }

            }
          );
      }
    });

    //jump-to-page
    $scope.navigateTo = function (date) {
      var dateFormatted = $filter('date')(date, 'yyyy-MM-dd');
      $location.path('/' + dateFormatted);
    };

  }]);

})();