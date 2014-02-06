( function() {
  'use strict';

  Commonplace.controllers.controller('IndexController', ['$scope', '$http', '$routeParams', '$filter', '$location', function($scope, $http, $routeParams, $filter, $location) {

    $scope.highlights = [];

    //time-chunking
    $scope.timeSlice = {
      beginning: null,
      end: null
    };

    var selectedDate = new Date();

    if ($routeParams.date !== "") {
      selectedDate = new Date($routeParams.date);
    };

    $scope.timeSlice.beginning = new Date(selectedDate);
    $scope.timeSlice.beginning.setHours(0,0,0,0);
    $scope.timeSlice.end = new Date(selectedDate);
    $scope.timeSlice.end.setHours(23,59,59,999);

    // Helper to check if the current item is within the slice bounds
    $scope.inTimeSlice = function(item) {
      var date = new Date(item.created);
      return (date > $scope.timeSlice.beginning && date < $scope.timeSlice.end);
    };

    // Helper for avoiding blank pages
    $scope.pageContentCheck = function (direction) {
      var pageItemCount = ($filter('filter')($scope.highlights, $scope.inTimeSlice)).length;
      if (pageItemCount === 0 && direction === "forward") {
        $scope.flickForwardOnePage();
      }
      else if (pageItemCount === 0 && direction !== "forward") {
        $scope.flickBackOnePage();
      }
    };


    //convert date to URL parmeter accepted format
    $scope.formatDate = function (date) {
      var dateFormatted = $filter('date')(date, 'yyyy-MM-dd');
      return (dateFormatted);
    };

    // TODO: will need to change these page flipping IF statements,
    // once things like creating new comments / twinglings repeats the card on today's date
    $scope.flickBackOnePage = function() {
      if ($scope.timeSlice.beginning > new Date($scope.highlights[0].created)) {
        $scope.timeSlice.beginning.setDate( $scope.timeSlice.beginning.getDate() - 1 );
        $scope.timeSlice.end.setDate( $scope.timeSlice.end.getDate() - 1 );
        $scope.pageContentCheck('back');
      }
    };

    $scope.flickForwardOnePage = function() {
      if ($scope.timeSlice.end < new Date($scope.highlights[$scope.highlights.length-1].created)) {
        $scope.timeSlice.beginning.setDate( $scope.timeSlice.beginning.getDate() + 1 );
        $scope.timeSlice.end.setDate( $scope.timeSlice.end.getDate() + 1 );
        $scope.pageContentCheck('forward');
      }
    };


    $scope.search = function(term) {
      $scope.searchResults.length = 0; //clears previous search results
      var tempSearchResults = [];
      var searchTerm = term.split(' ').join('+');
      $http.get('http://api.twin.gl/v1/search?q=' + searchTerm).success(
        function(results) {
          if (results.length !== 0) {
            for (var i = 0; i < results.length; i++) {

              if (results[i].result_type === "highlights") {
                $http.get('http://api.twin.gl/v1/highlights/' + results[i].result_object.id + '?expand=comments,twinglings').success(
          function(highlight) {
                  var found = false;
                  for (var j = 0; j < tempSearchResults.length; j++) {
                    if (tempSearchResults[j].id === highlight.id) {
                      found = true;
                    }
                  };
                  if (!found){
                    //sorts highlights' comments according to date created
                    if (highlight.comments.length > 1) {
                      highlight.comments.sort(function(a,b) {
                        return new Date(a.created) - new Date(b.created);
                      });
                    };
                    tempSearchResults.push(highlight);
                  }
                });
                $scope.showSearchNotice = false;
              }

              else if (results[i].result_type === "comments") {
                $http.get('http://api.twin.gl/v1/highlights/' + results[i].result_object.commented_id + '?expand=comments,twinglings').success(
          function(highlight) {
                  var found = false;
                  for (var j = 0; j < tempSearchResults.length; j++) {
                    if (tempSearchResults[j].id === highlight.id) {
                      found = true;
                    }
                  };
                  if (!found){
                    //sorts highlights' comments according to date created
                    if (highlight.comments.length > 1) {
                      highlight.comments.sort(function(a,b) {
                        return new Date(a.created) - new Date(b.created);
                      });
                    };
                    tempSearchResults.push(highlight);
                  }
                });
                $scope.showSearchNotice = false;
              }

              else {
                console.log('Error: Unrecognised search result object type.')
                $scope.showSearchNotice = true;
              }
            };

            $scope.searchResults = tempSearchResults;
            console.log($scope.searchResults);

          }
          else {
            $scope.showSearchNotice = true;
          }

          $scope.showSearchResults = true;
      });
    };


    //displays the number of twinglings of a card
    $scope.twinglingCount = function (count) {
      if (count > 0) {
        return count;
      }
      else {
        return "";
      }
    };


    //adds a twingling between two highlights
    $scope.twingling = {
      start_type: "highlights",
      start_id: "",
      end_type: "highlights",
      end_id: ""
    };

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
    };


    $scope.twinglingStart = function (id, index) {
      if ($scope.twinglingInProgress && id == $scope.selectedStartId && index == $scope.selectedStartIndex) {
        return true;
      }
      else {
        return false;
      }
    };


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
    };


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
    };


    // adds a comment to a highlight
    $scope.addComment = function(index, id, comment) {

      // update the DOM
      $scope.highlights[$scope.highlights.length-1-index].comments.push({body: comment});

      // post to the API
      $http.post('http://api.twin.gl/v1/highlights/' + id + '/comments', '{"body":"' + comment + '"}').success(
        function(data) {
          //TODO: fail gracefully
      });
    };


    // removes an object from the API
    $scope.deleteObject = function(objectType, id, parentIndex, childIndex) {
      // determine object type so as to update DOM
      if (objectType == "highlight") {
        $scope.highlights.splice(-parentIndex-1, 1);
      }
      else if (objectType == "comment") {
          $scope.highlights[$scope.highlights.length-1-parentIndex].comments.splice(childIndex, 1);
      };

      // delete the object --the added 's' part is probably confusing...
      $http.delete('http://api.twin.gl/v1/' + objectType + 's/' + id).success(
        function(data) {
          //TODO: fail gracefully (i.e. if a object is a highlight, push the highlight back into highlights array)
      });
    };
    /* END CONFIGURATION STUFF */

    // pulls all the current user's highlights
    $scope.$parent.loadingState = true;
    $http.get('http://api.twin.gl/v1/highlights?context=twingl://mine&;expand=comments,twinglings').success(
        function(data) {
          var tempHighlights = data;

          // catch new user
          if (tempHighlights.length == 0){
            console.log("No highlights");
            $scope.$parent.newUser = true;
          };

          //sorts highlights according to date created
          tempHighlights.sort(function(a,b) {
            return new Date(a.created) - new Date(b.created);
          });

          //sorts comments according to date created
          for (var i = tempHighlights.length - 1; i >= 0; i--) {
              tempHighlights[i].comments.sort(function(a,b) {
                return new Date(a.created) - new Date(b.created);
              });
          };

          $scope.highlights = tempHighlights;
          console.log($scope.highlights);

          // if initial page is blank (as in no activity today), go back until there is content
          $scope.pageContentCheck('back');
          $scope.$parent.loadingState = false;
        }
      );

    //search
    $scope.searchResults = [];

  }]);

})();
