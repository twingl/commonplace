( function() {
  'use strict';

  Commonplace.controllers.controller('IndexController', ['$scope', '$http', '$routeParams', '$filter', '$location', function($scope, $http, $routeParams, $filter, $location) {
    //time-chunking
    $scope.timeChunk = "";
    var selectedDate = "";

    if ($routeParams.date === ""){
      selectedDate = new Date();
      $scope.timeChunk = $filter('date')(selectedDate, 'yyyy-MM-dd');
    }
    else {
      selectedDate = new Date($routeParams.date);
      $scope.timeChunk = $routeParams.date;
    }

    $scope.flickBackOnePage = function() {
      selectedDate.setDate(selectedDate.getDate() -1);
      $scope.timeChunk = $filter('date')(selectedDate, 'yyyy-MM-dd');
    }

    $scope.flickForwardOnePage = function() {
      selectedDate.setDate(selectedDate.getDate() +1);
      $scope.timeChunk = $filter('date')(selectedDate, 'yyyy-MM-dd');
    }

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

        $scope.highlights = [];

        // pulls all the current user's highlights
        $http.get('http://api.twin.gl/flux/highlights?context=twingl://mine&;expand=comments,twinglings').success(
            function(data) {
              $scope.highlights = data;
              console.log($scope.highlights);
            }
          );

        //search
        $scope.searchResults = [];

        $scope.search = function(term) {
          $scope.searchResults.length = 0; //clears previous search results
          var searchTerm = term.split(' ').join('+');
          $http.get('http://api.twin.gl/flux/search?q=' + searchTerm).success(
            function(results) {
              if (results.length !== 0) {
                for (var i = 0; i < results.length; i++) {

                  if (results[i].result_type === "highlights") {
                    $http.get('http://api.twin.gl/flux/highlights/' + results[i].result_object.id + '?expand=comments,twinglings').success(
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
                  }

                  else if (results[i].result_type === "comments") {
                    $http.get('http://api.twin.gl/flux/highlights/' + results[i].result_object.commented_id + '?expand=comments,twinglings').success(
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
                  }

                  else {
                    console.log('Error: Unrecognised search result object type.')
                  }
                };
              }
              else {
                alert('There were no results matching your search term');
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

        $scope.newTwingling = function (id) {
          if ($scope.twingling.start_id === "") {
            $scope.twingling.start_id = id;
            $('.card__connect--swing').addClass('animated swing');
          }
          else if ($scope.twingling.start_id !== id) {
            $('.card__connect--swing').removeClass('animated swing');
            $scope.twingling.end_id = id;
            $http.post('http://api.twin.gl/flux/twinglings', $scope.twingling).success(function() {
              console.log("\nTwingled:")
              console.log($scope.twingling);
              $scope.twingling = {
                start_type: "highlights",
                start_id: "",
                end_type: "highlights",
                end_id: ""
              }
            });
          }
        }

        // adds a comment to a highlight
        $scope.addComment = function(index, id, comment) {
          $scope.highlights[$scope.highlights.length-1-index].comments.push({body: comment});
          $http.post('http://api.twin.gl/flux/highlights/' + id + '/comments', '{"body":"' + comment + '"}').success(
            function(data) {
              //TODO: fail gracefully
          })
        }

        // removes a highlight from the API, but doesn't update the DOM
        $scope.deleteHighlight = function(index, id) {
          $scope.highlights.splice(-index-1, 1);
          $http.delete('http://api.twin.gl/flux/highlights/' + id).success(
            function(data) {
              //TODO: fail gracefully (i.e. push highlight back into highlights array)
          })
        }

      }
    });

    //jump-to-page
    $scope.navigateTo = function (date) {
      $scope.showSearchResults = false;
      $scope.timeChunk = $filter('date')(date, 'yyyy-MM-dd');
    };

  }]);

})();
