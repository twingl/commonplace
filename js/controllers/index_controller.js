( function() {
  'use strict';

  Commonplace.controllers.controller( 'IndexController', ['$scope', '$http', function($scope, $http) {
    OAuth.initialize('vriVw-S06p3A34LnSbGoZ2p0Fhw');

    //NB NEED TO CHANGE FROM SANDBOX TO *API* WHEN READY

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

        $scope.highlights = [];

        // pulls all the current user's highlights
        $http.get('http://api.twin.gl/flux/highlights?context=twingl://mine').success(
            function(data) {
              $scope.highlights = data;
              console.log($scope.highlights);
            }
          );

        // $scope.dateCreator = function(time_string){
        //   var date = new Date(time_string);
        //   console.log(date);
        // }

        //adds a twingling between two highlights
        $scope.twingling = {
          start_type: "highlights",
          start_id: "",
          end_type: "highlights",
          end_id: ""
        }

        $scope.newTwingling = function (type, id) {
          if ($scope.twingling.start_id === "") {
            $scope.twingling.start_id = id;
          }
          else {
            $scope.twingling.end_id = id;
            $http.post('http://api.twin.gl/flux/twinglings', $scope.twingling).success(function() {
              console.log("\nTwingled:")
              console.log($scope.twingling);
              $scope.twingling = {
                start_type: "",
                start_id: "",
                end_type: "",
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
        $scope.deleteHighlight = function(id) {
          $http.delete('http://api.twin.gl/flux/highlights/' + id).success(
            function(data) {
              console.log(data);
          })
        }

      }
    });

  }]);

})();
