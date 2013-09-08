(function() {
  'use strict';

  Commonplace.controllers.controller('TwinglingController', ['$auth', '$scope', '$http',
    function($auth, $scope, $http) {

      $scope.highlights = [];
      $scope.twinglings = [];
      $http.get('http://api.twin.gl/v1/highlights?context=twingl://mine').success(function(data1) {
        $scope.highlights = data1;
        for (var i = 0; i < $scope.highlights.length; i++) {
          $http.get('http://api.twin.gl/v1/highlights/' + $scope.highlights[i].id + '/twinglings').success(function(data2) {
            for (var j = 0; j < data2.length; j++) {
              var currentTwingling = {
                id: data2[j].id,
                start: {},
                end: {},
                created: data2[j].created
              };
              $http.get('http://api.twin.gl/v1/highlights/' + data2[j].start_id).success(function(startHighlight) {
                currentTwingling.start = startHighlight;
              });
              $http.get('http://api.twin.gl/v1/highlights/' + data2[j].end_id).success(function(endHighlight) {
                currentTwingling.end = endHighlight;
              });
              $scope.twinglings.push(currentTwingling);
              console.log($scope.twinglings)
            };
          });
        };
      });

    }
  ]);
})();
