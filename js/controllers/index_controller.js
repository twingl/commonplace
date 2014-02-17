( function() {
  'use strict';

  Commonplace.controllers.controller('IndexController', ['$scope', '$http', '$route', '$routeParams', '$filter', '$location', function($scope, $http, $route, $routeParams, $filter, $location) {





    //
    // CONFIGURATION STUFF
    //

    $scope.cards = [];
    $scope.headerNavigationState = [];
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

        //filter
        $scope.cards = $filter('filter')($scope.highlights, $scope.inTimeSlice);

        $scope.pageContentCheck('back');
      }
    };

    $scope.flickForwardOnePage = function() {
      if ($scope.timeSlice.end < new Date($scope.highlights[$scope.highlights.length-1].created)) {
        $scope.timeSlice.beginning.setDate( $scope.timeSlice.beginning.getDate() + 1 );
        $scope.timeSlice.end.setDate( $scope.timeSlice.end.getDate() + 1 );

        // filter
        $scope.cards = $filter('filter')($scope.highlights, $scope.inTimeSlice);

        $scope.pageContentCheck('forward');
      }
    };





    //
    // TODO: Will become cardView model or controller
    // For now: card array switch
    //
    $scope.cardView = function (view) {
      if (view == "highlights") {
          $scope.headerNavigationState = "highlights";
          $scope.cards = $filter('filter')($scope.highlights, $scope.inTimeSlice);
      }
      else if (view == "search") {

      }
    }



    //
    // SEARCH
    //

    $scope.search = function(term) {

          // Show that something is happening
          $scope.$parent.loadingState = true;
          $scope.headerNavigationState = 'loading';
          $scope.cards.length = 0;

          // Clears previous search results
          $scope.searchResults.length = 0; 
          var searchString = term.split(' ').join('+');

          $http.get('http://api.twin.gl/v1/search?q=' + searchString).success(
            function(results) {

              // If there are results, let the magic begin
              if (results.length !== 0) {

                for (var i = 0; i < results.length; i++) {

                  var highlightIDToFind = 0;

                  // Determine the highlight_id to pull from highlights array
                  // Assumes results are highlights or comments
                  if (results[i].result_type === "highlights") {
                    highlightIDToFind = results[i].result_object.id;
                  }
                  else if (results[i].result_type === "comments") {
                    highlightIDToFind = results[i].result_object.commented_id;
                  }

                  var highlightObject = $scope.highlights.filter(function (element) {
                    return element.id === highlightIDToFind;
                  });

                  $scope.searchResults.push(highlightObject[0]);

                };

                // Render the cards in the main view
                $scope.searchStatus = "Search results for \"" + term + "\"";     
                $scope.cards = $scope.searchResults;
                console.log($scope.cards);

              }

              // If there lacks results, display a notice to that effect
              else {
                $scope.searchStatus = "Sorry, there were no results containing \"" + term + "\" found.";
              };

              // Clear the input box
              $scope.searchTerm = "";

              // Show the outcome
              $scope.$parent.loadingState = false;
              $scope.headerNavigationState = 'search';

          });
        };





    //
    // COMMENT CREATION
    //

    $scope.addComment = function(index, id, comment) {
      // show Card Actions, hide New Comment section
      $scope.cards[index].hideCardActions = false;
      $scope.cards[index].showNewCommentSection = false;

      // post to the API
      $http.post('http://api.twin.gl/v1/highlights/' + id + '/comments', '{"body":"' + comment + '"}').success(
        function(commentObject) {

          // update the DOM
          $scope.cards[index].card_feed.push({type: "comment", body: comment, id: commentObject.id});

          // If all is well, update the local cache-like array
          highlightsUpdate('update', id, $scope.cards[index]);

      });
    };





    //
    // TWINGL OBJECT DELETION
    //

    $scope.deleteObject = function(objectType, id, parentIndex, childIndex) {

      // delete the object --the added 's' part is probably confusing...
      $http.delete('http://api.twin.gl/v1/' + objectType + 's/' + id).success(
        function(data) {

          // determine object type so as to update DOM
          if (objectType == "highlight") {
            $scope.cards.splice(parentIndex, 1);
          }
          else if (objectType == "comment" || objectType == "twingling") {
            $scope.cards[parentIndex].card_feed.splice(childIndex, 1);
          };

          // If all is well, update local cache-like array
          highlightsUpdate('delete', id, $scope.cards[parentIndex]);
      });

    };





    //
    // HIGHLIGHTS CACHE-LIKE ARRAY UPDATE
    //

    var highlightsUpdate = function (action, id, object) {

      // Find the whereabouts of the effected card from the array
      var index = $scope.highlights.map(function(e) { return e.id; }).indexOf(id);

      if (action === "delete") {
        // Splice the object
        $scope.highlights.splice(index, 1)
      }
      else if (action === "update") {
        // Replace the object
        $scope.highlights[index] = object;
      }

    };





    //
    // PULL HIGHLIGHTS
    //

    // Show that something is happening
    $scope.$parent.loadingState = true;
    $scope.headerNavigationState = 'loading';

    $http.get('http://api.twin.gl/v1/highlights?context=twingl://mine&;expand=comments,twinglings').success(
        function(data) {
          $scope.highlights = data;

          // Catch instance where user has no highlights
          if ($scope.highlights.length == 0){
            console.log("No highlights");
            $scope.$parent.newUser = true;
          };

          // Sort highlights according to date created
          $scope.highlights.sort(function(a,b) {
            return new Date(a.created) - new Date(b.created);
          });



          // Loop though the highlights array
          for (var i = $scope.highlights.length - 1; i >= 0; i--) {


              // Create card_feed variable
              var cardFeed = [];


              // Push comments to cardFeed, if there's any
              if ($scope.highlights[i].comments.length !== 0) {
                for (var j = 0; j <= $scope.highlights[i].comments.length - 1; j++) {
                  // Staging variable
                  var commentCardFeedObject = {};

                  // Set commentCardFeedObject
                  commentCardFeedObject.type = "comment";
                  commentCardFeedObject.id = $scope.highlights[i].comments[j].id;
                  commentCardFeedObject.created = $scope.highlights[i].comments[j].created;
                  commentCardFeedObject.body = $scope.highlights[i].comments[j].body;

                  // Push object to cardFeed
                  cardFeed.push(commentCardFeedObject);

                };
              };


              // Push twinglings to cardFeed, if there's any
              if ($scope.highlights[i].twinglings.length !== 0) {
                for (var k = 0; k <= $scope.highlights[i].twinglings.length - 1; k++) {
                  // Staging variable
                  var twinglingCardFeedObject = {};

                  // Remove current highlight from twingling pairs
                  var twingledHighlightId = "";
                  var end_object_id = $scope.highlights[i].twinglings[k].end_id;

                  if (end_object_id !== $scope.highlights[i].id) {
                    twingledHighlightId = end_object_id;
                  }
                  else {
                    twingledHighlightId = $scope.highlights[i].twinglings[k].start_id;
                  }

                  // Retrieve twingled quote
                  var twingledObject = $scope.highlights.filter(function (element) {
                      return element.id === twingledHighlightId && element.context_url !== undefined;
                    });

                  if (twingledObject.length > 0) {
                    // Initialise twinglingCardFeedObject
                    twinglingCardFeedObject.type = "twingling";
                    twinglingCardFeedObject.id = $scope.highlights[i].twinglings[k].id;
                    twinglingCardFeedObject.created = $scope.highlights[i].twinglings[k].created;
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


              // Push cardFeed variable to $scope.highlights
              $scope.highlights[i].card_feed = cardFeed;

          };


          // Render the cards in the main view
          console.log($scope.highlights);
          $scope.headerNavigationState = 'highlights';
          $scope.cards = $filter('filter')($scope.highlights, $scope.inTimeSlice);
          

          // if initial page is blank (as in no activity today), go back until there is content
          $scope.pageContentCheck('back');
          $scope.$parent.loadingState = false;
        }
      );


  }]);

})();
