(function() {
  'use strict';

  Commonplace.controllers.controller('HighlightController', ['$scope', '$http', '$routeParams', '$filter', '$location', function($scope, $http, $routeParams, $filter, $location) {

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

              $http.get('http://api.twin.gl/v1/highlights/' + twingledHighlightId + '?expand=comments,twinglings').success(
              function(twingledHighlight) {
                      twingledHighlightObject = twingledHighlight;
                      $scope.twinglings.push(twingledHighlightObject);
                    });
            };
          }

          //pulls other highlights from that article
          $http.get('http://api.twin.gl/v1/highlights?context=' + $scope.highlight.context_url + '&;expand=comments,twinglings').success(
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
      
    //redirect to the current highlight's twinglings view
    $scope.showTwinglings = function (id) {
      $location.path('/highlights/' + id);
    }

    //displays the number of twinglings of a card (an example of a shared function to be added to a service)
    $scope.twinglingCount = function (count) {
      if (count > 0) {
        return count;
      }
      else {
        return "";
      }
    }

    //jump-to-page
    $scope.navigateTo = function (date) {
      var dateFormatted = $filter('date')(date, 'yyyy-MM-dd');
      $location.path('/' + dateFormatted);
    };

  }]);

})();
