(function() {
  'use strict';

  Commonplace.controllers.controller('HighlightController', ['$scope', '$http', '$routeParams', '$filter', '$location', function($scope, $http, $routeParams, $filter, $location) {

    $scope.highlight = {};
    $scope.twinglings = [];
    $scope.highlights = [];

    // pulls the current user's selecyed highlight
    $scope.$parent.loadingState = true;
    $http.get('http://api.twin.gl/v1/highlights/' + $routeParams.highlight_id + '?expand=comments,twinglings').success(
        function(highlight) {
          $scope.highlight = highlight;

          //remove current highlight from twingling pair
          if (highlight.twinglings.length !== 0) {
            for (var i = 0; i <= $scope.highlight.twinglings.length - 1; i++) {
              var end_object_id = $scope.highlight.twinglings[i].end_id;
              var twinglingID = $scope.highlight.twinglings[i].id;
              var twingledHighlightId = "";
              var twingledHighlightObject = {};

              if (end_object_id !== $scope.highlight.id) {
                twingledHighlightId = end_object_id;
              }
              else {
                twingledHighlightId = $scope.highlight.twinglings[i].start_id;
              }

              //pull twingled highlight's comments
              $http.get('http://api.twin.gl/v1/highlights/' + twingledHighlightId + '?expand=comments').success(
              function(twingledHighlight) {
                twingledHighlightObject = twingledHighlight;

                //HELP HERE PLZ
                twingledHighlightObject.twinglingID = twinglingID;

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
                  $scope.$parent.loadingState = false;
                });
        });

    //displays the number of twinglings of a card (an example of a shared function to be added to a service)
    $scope.twinglingCount = function (count) {
      if (count > 0) {
        return count;
      }
      else {
        return "";
      }
    }

    //redirect to the current highlight's twinglings view
    $scope.showTwinglings = function (id) {
      $location.path('/highlights/' + id);
    }

    //adds a twingling between two highlights
    $scope.twingling = {
      start_type: "highlights",
      start_id: "",
      end_type: "highlights",
      end_id: ""
    }

    //twingling animation variables for ng-class
    $scope.twinglingInProgress = false;
    $scope.selectedStartOrigin = "";
    $scope.selectedStartIndex = -1;
    $scope.selectedStartId = -1;

    $scope.twinglingAnimate = function (id, index) {
      if ($scope.twinglingInProgress && id !== $scope.selectedStartId && index !== $scope.selectedStartIndex) {
        return true;
      }
      else if ($scope.twinglingInProgress && id !== $scope.selectedStartId && index == $scope.selectedStartIndex) {
        return true;
      }
      else {
        return false;
      }
    }

    $scope.twinglingStart = function (id, index) {
      if ($scope.twinglingInProgress && id == $scope.selectedStartId && index == $scope.selectedStartIndex) {
        return true;
      }
      else {
        return false;
      }
    }

    $scope.twinglingEnd = function (id, index) {
      if ($scope.twinglingInProgress && id !== $scope.selectedStartId && index !== $scope.selectedStartIndex) {
        return true;
      }
      else if ($scope.twinglingInProgress && id !== $scope.selectedStartId && index == $scope.selectedStartIndex) {
        return true;
      }
      else {
        return false;
      }
    }

    $scope.newTwingling = function (origin, id, index) {
      //if highlight is the start point...
      if ($scope.twingling.start_id == "") {
        $scope.selectedStartOrigin = origin;
        $scope.selectedStartIndex = index;
        $scope.selectedStartId = id;
        $scope.twinglingInProgress = true;
        $scope.twingling.start_id = id;
      }
      //if highlight is the end point (and if end point != start point)...
      else if ($scope.twingling.start_id !== id) {
        $scope.twinglingInProgress = false;
        $scope.twingling.end_id = id;
        console.log($scope.twingling);

        //increase real time twingl count: start point
        if ($scope.selectedStartOrigin == 'highlights') {
          $scope.highlights[$scope.highlights.length-1-$scope.selectedStartIndex].twinglings.push($scope.twingling);
        }
        else if ($scope.selectedStartOrigin == 'results') {
          $scope.searchResults[$scope.selectedStartIndex].twinglings.push($scope.twingling);
        }

        //increase real time twingl count: end point
        if (origin == 'highlights') {
          $scope.highlights[$scope.highlights.length-1-index].twinglings.push($scope.twingling);
        }
        else if (origin == 'results') {
          $scope.searchResults[index].twinglings.push($scope.twingling);
        }

        //post twingling object
        $http.post('http://api.twin.gl/v1/twinglings', $scope.twingling).success(function() {
          $scope.twingling = {
            start_type: "highlights",
            start_id: "",
            end_type: "highlights",
            end_id: ""
          }
          console.log('Twingling successfully created!');
          $scope.twinglingInProgress = false;
          $scope.selectedStartOrigin = "";
          $scope.selectedStartIndex = -1;
          $scope.selectedStartId = -1;
        });
      }
    }

    //removes a twingling's relationship with the current highlight
    $scope.removeTwingling = function (twinglingID, index) {
      console.log(twinglingID, index);
    }

    //jump-to-page
    $scope.navigateTo = function (date) {
      var dateFormatted = $filter('date')(date, 'yyyy-MM-dd');
      $location.path('/' + dateFormatted);
    };

  }]);

})();
