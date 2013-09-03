( function() {
  'use strict';

  Commonplace.controllers.controller('IndexController', ['$auth', '$scope', '$http', '$routeParams', '$filter', '$location', function($auth, $scope, $http, $routeParams, $filter, $location) {

    $scope.highlights = [];

    //time-chunking
    $scope.timeSlice = {
      beginning: null,
      end: null
    };

    var selectedDate = new Date();

    if ($routeParams.date !== "") {
      selectedDate = new Date($routeParams.date);
    }

    $scope.timeSlice.beginning = new Date(selectedDate);
    $scope.timeSlice.beginning.setHours(0,0,0,0);
    $scope.timeSlice.end = new Date(selectedDate);
    $scope.timeSlice.end.setHours(23,59,59,999);

    // Helper to check if the current item is within the slice bounds
    $scope.inTimeSlice = function(item) {
      var date = new Date(item.created);
      return (date > $scope.timeSlice.beginning && date < $scope.timeSlice.end);
    }

    // Helper for avoiding blank pages
    $scope.pageContentCheck = function (direction) {
      var pageItemCount = ($filter('filter')($scope.highlights, $scope.inTimeSlice)).length;
      if (pageItemCount === 0 && direction === "forward") {
        $scope.flickForwardOnePage();
      }
      else if (pageItemCount === 0 && direction !== "forward") {
        $scope.flickBackOnePage();
      }
    }

    //jump-to-page
    //FIXME the following should use the URL param to handle navigation
    $scope.navigateTo = function (date) {
      $scope.showSearchResults = false;

      date = new Date(date);
      $scope.timeSlice.beginning.setDate(date.getDate());
      $scope.timeSlice.beginning.setMonth(date.getMonth());
      $scope.timeSlice.beginning.setFullYear(date.getFullYear());
      $scope.timeSlice.end.setDate(date.getDate());
      $scope.timeSlice.end.setMonth(date.getMonth());
      $scope.timeSlice.end.setFullYear(date.getFullYear());
    };

    //keystroke navigation
    $scope.keyPress = function($event) {
      if ($event.keyCode === 37) {
        $scope.flickBackOnePage();
      }
      else if ($event.keyCode === 39) {
        $scope.flickForwardOnePage();
      }
      $event.preventDefault();
    }

    // TODO: will need to change these page flipping IF statements,
    // once things like creating new comments / twinglings repeats the card on today's date
    $scope.flickBackOnePage = function() {
      if ($scope.timeSlice.beginning > new Date($scope.highlights[0].created)) {
        $scope.timeSlice.beginning.setDate( $scope.timeSlice.beginning.getDate() - 1 );
        $scope.timeSlice.end.setDate( $scope.timeSlice.end.getDate() - 1 );
        $scope.pageContentCheck('back');
      }
    }

    $scope.flickForwardOnePage = function() {
      if ($scope.timeSlice.end < new Date($scope.highlights[$scope.highlights.length-1].created)) {
        $scope.timeSlice.beginning.setDate( $scope.timeSlice.beginning.getDate() + 1 );
        $scope.timeSlice.end.setDate( $scope.timeSlice.end.getDate() + 1 );
        $scope.pageContentCheck('forward');
      }
    }

    $scope.search = function(term) {
      $scope.searchResults.length = 0; //clears previous search results
      var searchTerm = term.split(' ').join('+');
      $http.get('http://api.twin.gl/v1/search?q=' + searchTerm).success(
        function(results) {
          if (results.length !== 0) {
            for (var i = 0; i < results.length; i++) {

              if (results[i].result_type === "highlights") {
                $http.get('http://api.twin.gl/v1/highlights/' + results[i].result_object.id + '?expand=comments,twinglings').success(
          function(highlight) {
                  var found = false;
                  for (var j = 0; j < $scope.searchResults.length; j++) {
                    if ($scope.searchResults[j].id === highlight.id) {
                      found = true;
                    }
                  };
                  if (!found){
                    $scope.searchResults.push(highlight);
                  }
                });
                $scope.showSearchNotice = false;
              }

              else if (results[i].result_type === "comments") {
                $http.get('http://api.twin.gl/v1/highlights/' + results[i].result_object.commented_id + '?expand=comments,twinglings').success(
          function(highlight) {
                  var found = false;
                  for (var j = 0; j < $scope.searchResults.length; j++) {
                    if ($scope.searchResults[j].id === highlight.id) {
                      found = true;
                    }
                  };
                  if (!found){
                    $scope.searchResults.push(highlight);
                  }
                });
                $scope.showSearchNotice = false;
              }

              else {
                console.log('Error: Unrecognised search result object type.')
                $scope.showSearchNotice = true;
              }
            };
          }
          else {
            $scope.showSearchNotice = true;
          }
          $scope.showSearchResults = true;
      });
    }

    //redirect to the current highlight's twinglings view
    $scope.showTwinglings = function (id) {
      $location.path('/highlights/' + id);
    }

    //displays the number of twinglings of a card
    $scope.twinglingCount = function (count) {
      if (count > 0) {
        return count;
      }
      else {
        return "";
      }
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
      if ($scope.twingling.start_id === "") {
        $scope.selectedStartIndex = index;
        $scope.selectedStartId = id;
        $scope.twinglingInProgress = true;
        $scope.twingling.start_id = id;
      }
      else if ($scope.twingling.start_id !== id) {
        $scope.twinglingInProgress = false;
        $scope.twingling.end_id = id;

        //increase real time twingl count
        console.log($scope.highlights);
        console.log($scope.twingling);
        if (origin == 'highlights') {
          $scope.highlights[$scope.highlights.length-1-$scope.selectedStartIndex].twinglings.push($scope.twingling);
          $scope.highlights[$scope.highlights.length-1-index].twinglings.push($scope.twingling);
          console.log($scope.highlights);
        }
        else {
          $scope.results[$scope.highlights.length-1-$scope.selectedStartIndex].twinglings.push($scope.twingling);
          $scope.results[$scope.highlights.length-1-index].twinglings.push($scope.twingling);
        }

        $http.post('http://api.twin.gl/v1/twinglings', $scope.twingling).success(function() {
          $scope.twingling = {
            start_type: "highlights",
            start_id: "",
            end_type: "highlights",
            end_id: ""
          }
          console.log('Twingling successfully created!');
          $scope.selectedStartIndex = -1;
        });
      }
    }

    // adds a comment to a highlight
    $scope.addComment = function(index, id, comment) {
      $scope.highlights[$scope.highlights.length-1-index].comments.push({body: comment});
      $http.post('http://api.twin.gl/v1/highlights/' + id + '/comments', '{"body":"' + comment + '"}').success(
        function(data) {
          //TODO: fail gracefully
      })
    }

    // removes a highlight from the API, but doesn't update the DOM
    $scope.deleteHighlight = function(index, id) {
      $scope.highlights.splice(-index-1, 1);
      $http.delete('http://api.twin.gl/v1/highlights/' + id).success(
        function(data) {
          //TODO: fail gracefully (i.e. push highlight back into highlights array)
      })
    }

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

        // pulls all the current user's highlights
        $http.get('http://api.twin.gl/v1/highlights?context=twingl://mine&;expand=comments,twinglings').success(
            function(data) {
              $scope.highlights = data;
              console.log($scope.highlights);
              // if initial page is blank (as in no activity today), go back until there is content
              $scope.pageContentCheck('back');
            }
          );

        //search
        $scope.searchResults = [];
      },

      function(error) { //error
        console.log("There was a problem!", error);
      });

  }]);

})();
