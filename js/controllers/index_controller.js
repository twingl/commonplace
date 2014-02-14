( function() {
  'use strict';

  Commonplace.controllers.controller('IndexController', ['$scope', '$http', '$route', '$routeParams', '$filter', '$location', function($scope, $http, $route, $routeParams, $filter, $location) {





    //
    // CONFIGURATION STUFF
    //

    $scope.highlights = [];
    $scope.searchResults = [];

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

    /* END CONFIGURATION STUFF */





    //
    // NAVIGATION
    //

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





    //
    // SEARCH
    //

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





    //
    // COMMENT CREATION
    //

    $scope.addComment = function(index, id, comment) {
      // show Card Actions, hide New Comment section
      $scope.highlights[$scope.highlights.length-1-index].hideCardActions = false;
      $scope.highlights[$scope.highlights.length-1-index].showNewCommentSection = false;

      // update the DOM
      $scope.highlights[$scope.highlights.length-1-index].comments.push({body: comment});

      // post to the API
      $http.post('http://api.twin.gl/v1/highlights/' + id + '/comments', '{"body":"' + comment + '"}').success(
        function(data) {
          //TODO: fail gracefully
      });
    };





    //
    // TWINGL OBJECT DELETION
    //

    $scope.deleteObject = function(objectType, id, parentIndex, childIndex) {
      // determine object type so as to update DOM
      if (objectType == "highlight") {
        $scope.highlights.splice(-parentIndex-1, 1);
      }
      else if (objectType == "comment" || objectType == "twingling") {
          $scope.highlights[$scope.highlights.length-1-parentIndex].card_feed.splice(childIndex, 1);
      };

      // delete the object --the added 's' part is probably confusing...
      $http.delete('http://api.twin.gl/v1/' + objectType + 's/' + id).success(
        function(data) {
          //TODO: fail gracefully (i.e. if a object is a highlight, push the highlight back into highlights array)
      });
    };





    //
    // PULL HIGHLIGHTS
    //

    $scope.$parent.loadingState = true;
    $http.get('http://api.twin.gl/v1/highlights?context=twingl://mine&;expand=comments,twinglings').success(
        function(data) {
          var tempHighlights = data;

          // Catch instance where user has no highlights
          if (tempHighlights.length == 0){
            console.log("No highlights");
            $scope.$parent.newUser = true;
          };

          // Sort highlights according to date created
          tempHighlights.sort(function(a,b) {
            return new Date(a.created) - new Date(b.created);
          });



          // Loop though the highlights array
          for (var i = tempHighlights.length - 1; i >= 0; i--) {


              // Create card_feed variable
              var cardFeed = [];


              // Push comments to cardFeed, if there's any
              if (tempHighlights[i].comments.length !== 0) {
                for (var j = 0; j <= tempHighlights[i].comments.length - 1; j++) {
                  // Staging variable
                  var commentCardFeedObject = {};

                  // Set commentCardFeedObject
                  commentCardFeedObject.type = "comment";
                  commentCardFeedObject.id = tempHighlights[i].comments[j].id;
                  commentCardFeedObject.created = tempHighlights[i].comments[j].created;
                  commentCardFeedObject.body = tempHighlights[i].comments[j].body;

                  // Push object to cardFeed
                  cardFeed.push(commentCardFeedObject);

                };
              };


              // Push twinglings to cardFeed, if there's any
              if (tempHighlights[i].twinglings.length !== 0) {
                for (var k = 0; k <= tempHighlights[i].twinglings.length - 1; k++) {
                  // Staging variable
                  var twinglingCardFeedObject = {};

                  // Remove current highlight from twingling pairs
                  var twingledHighlightId = "";
                  var end_object_id = tempHighlights[i].twinglings[k].end_id;

                  if (end_object_id !== tempHighlights[i].id) {
                    twingledHighlightId = end_object_id;
                  }
                  else {
                    twingledHighlightId = tempHighlights[i].twinglings[k].start_id;
                  }

                  // Retrieve twingled quote
                  var twingledObject = tempHighlights.filter(function (element) {
                      return element.id === twingledHighlightId && element.context_url !== undefined;
                    });

                  if (twingledObject.length > 0) {
                    // Initialise twinglingCardFeedObject
                    twinglingCardFeedObject.type = "twingling";
                    twinglingCardFeedObject.id = tempHighlights[i].twinglings[k].id;
                    twinglingCardFeedObject.created = tempHighlights[i].twinglings[k].created;
                    twinglingCardFeedObject.highlight_id = twingledHighlightId;
                    twinglingCardFeedObject.highlight_quote = twingledObject[0].quote;
                    twinglingCardFeedObject.highlight_created = twingledObject[0].created;
                    // Push object to cardFeed
                    cardFeed.push(twinglingCardFeedObject);
                  }




                };
              };


              // Sort cardFeed according to date created
              cardFeed.sort(function(a,b) {
                return new Date(a.created) - new Date(b.created);
              });


              // Push cardFeed variable to tempHighlights
              tempHighlights[i].card_feed = cardFeed;

          };



          $scope.highlights = tempHighlights;
          console.log($scope.highlights);


          // if initial page is blank (as in no activity today), go back until there is content
          $scope.pageContentCheck('back');
          $scope.$parent.loadingState = false;
        }
      );





  }]);

})();
