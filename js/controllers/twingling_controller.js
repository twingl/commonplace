(function() {
  'use strict';

  Commonplace.controllers.controller('TwinglingController', ['$scope', '$http',
    function($scope, $http) {
      OAuth.initialize('vriVw-S06p3A34LnSbGoZ2p0Fhw');

      //Using popup (option 1)
      OAuth.popup('twingl', function(error, result) {
        //handle error with error
        //use result.access_token in your API request
        if (error) {
          console.log("An error occurs.");
        } else {
          window.access_token = result;
          $http.defaults.headers.common['Authorization'] = 'Bearer ' + result.access_token;
          /* END CONFIGURATION STUFF */

          $scope.highlights = [];
          $scope.twinglings = [];
          $http.get('http://api.twin.gl/flux/highlights?context=twingl://mine').success(function(data1) {
            $scope.highlights = data1;
            for (var i = 0; i < $scope.highlights.length; i++) {
              $http.get('http://api.twin.gl/flux/highlights/' + $scope.highlights[i].id + '/twinglings').success(function(data2) {
                for (var j = 0; j < data2.length; j++) {
                  var currentTwingling = {
                    id: data2[j].id,
                    start: {},
                    end: {},
                    created: data2[j].created
                  };
                  $http.get('http://api.twin.gl/flux/highlights/' + data2[j].start_id).success(function(startHighlight) {
                    currentTwingling.start = startHighlight;
                  });
                  $http.get('http://api.twin.gl/flux/highlights/' + data2[j].end_id).success(function(endHighlight) {
                    currentTwingling.end = endHighlight;
                  });
                  $scope.twinglings.push(currentTwingling);
                  console.log($scope.twinglings)
                };
              });
            };
          });
        }
      });
    }
  ]);
})();