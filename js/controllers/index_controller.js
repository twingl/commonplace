( function() {
  'use strict';

  Commonplace.controllers.controller('IndexController', ['$scope', '$http', '$filter', '$location', function($scope, $http, $filter, $location) {
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
        $http.get('http://api.twin.gl/flux/highlights?context=twingl://mine&;expand=comments').success(
            function(data) {
              $scope.highlights = data;
              console.log($scope.highlights);
            }
          );

        //time-chunking
        var selectedDate = new Date();
        $scope.timeChunk = $filter('date')(selectedDate, 'yyyy-MM-dd');

        $scope.flickBackOnePage = function() {
          selectedDate.setDate(selectedDate.getDate() -1);
          $scope.timeChunk = $filter('date')(selectedDate, 'yyyy-MM-dd');
        }

        $scope.flickForwardOnePage = function() {
          selectedDate.setDate(selectedDate.getDate() +1);
          $scope.timeChunk = $filter('date')(selectedDate, 'yyyy-MM-dd');
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
        $scope.addComment = function(id, comment) {
          $http.post('http://api.twin.gl/flux/highlights/' + id + '/comments', '{"body":"' + comment + '"}').success(
            function(data) {
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

  }]);

})();
