( function() {
  'use strict';

  Commonplace.controllers.controller('LinkController', ['$scope', 'linkService', function($scope, linkService) {

    // Stage a resource for twingling.
    // If there is nothing in the origin of the service, the resource will be
    // set as the origin, otherwise it will be the destination.
    $scope.stageResource = function(type, id, object) {
      if (linkService.origin() === undefined) {
        var terminations = linkService.terminations();
        if (Object.keys(terminations).indexOf(type + "-" + id) < 0) //FIXME style, law of demeter violation
          linkService.setOrigin(type, id, object); //FIXME should not need to supply object
      } else {
        // Only stage termination point if we don't already have one and
        // it's not the origin
        var origin = linkService.origin();
        var nTerminations = Object.keys(linkService.terminations()).length
        if (nTerminations === 0 && (origin.id !== id || origin.type !== type)) {
          linkService.stageTermination(type, id, object); //FIXME should not need to supply object
        }
      }
    };

    // Return the termination object
    $scope.termination = function() {
      var key = Object.keys(linkService.terminations())[0];
      if (key) return linkService.terminations()[key].object;
    };

    // Return the origin object
    $scope.origin = function() {
      if (linkService.origin()) return linkService.origin().object;
    };

    $scope.originText = function() {
      var o = $scope.origin();
      if (o) return $scope.display($scope.origin()).text;
    };

    // Clear the origin resource
    $scope.clearOrigin = function() {
      linkService.clearOrigin();
    };

    // Clear the termination point if present.
    // Can be augmented to support multiple termination points, but for now
    // we'll treat them as only having a single termination that's supported.
    $scope.clearTermination = function() {
      linkService.clearTerminations();
    };

    $scope.showInterface = function() {
      return ($scope.origin() || $scope.termination());
    };

    $scope.enableCommit = function() {
      return $scope.origin() && $scope.termination();
    };

    $scope.commitLink = function() {
      linkService.commitTerminations();
    };

    $scope.print = function() { return linkService.print(); };
  }]);
})();
