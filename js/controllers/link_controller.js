( function() {
  'use strict';

  Commonplace.controllers.controller('LinkController', ['$scope', '$timeout', 'linkService', function($scope, $timeout, linkService) {

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

    // The copy displayed on the stage link button - changes depending on the
    // link ui state
    $scope.linkButtonText = function(card) {
      if (linkService.origin() && linkService.origin().id === card.id) {
        return "&nbsp;";
      } else if (linkService.origin() && Object.keys(linkService.terminations()).length > 0) {
        return "&nbsp;";
      } else if (linkService.origin()) {
        return "<i class='fa fa-link'></i>";
      }
      return "<i class='fa fa-link'></i> Link this to";
    };

    $scope.linkButtonDisabled = function(card) {
      if (linkService.origin() && linkService.origin().id === card.id) {
        return true;
      } else if (linkService.origin() && Object.keys(linkService.terminations()).length > 0) {
        return true;
      }
      return false;
    }

    $scope.linkButtonClass = function(card) {
      if (linkService.origin() && linkService.origin().id === card.id) {
        return "";
      } else if (linkService.origin() && Object.keys(linkService.terminations()).length === 0) {
        return "link_ui__call_to_action";
      }
      return "";
    }

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

    $scope.uiStatus = function() {
      if ($scope.commited) {
        $scope.state = ($scope.success === true) ? "success" : "error";
        if (!$scope.timeout) {
          $scope.timeout = true;
          $timeout(function() {
            $scope.commited = false;
            $scope.working = false;
            $scope.timeout = false;
            if ($scope.success === true) {
              $scope.success = undefined;
              $scope.clearOrigin();
              $scope.clearTermination();
            }
          }, 1000)
        }
      }
      else if ($scope.working) {
        $scope.state = "working";
      }
      else if ($scope.enableCommit()) {
        $scope.state = "pending";
      }
      else {
        $scope.state = "ineligible";
      }
      return $scope.state;
    };

    $scope.orbIcon = function() {
      switch ($scope.uiStatus()) {
        case "working":
          return "fa-ellipsis-h";
        case "pending":
          return "fa-link";
        case "ineligible":
          return "";
        case "success":
          return "fa-check";
        case "error":
          return "fa-exclamation";
      }
    };

    $scope.commitLink = function() {
      if ($scope.enableCommit()) {
        $scope.working = true;
        linkService.commitTerminations(
          function(data) {
            $scope.$parent.newLinkCreated(data);
            $scope.commited = true;
            $scope.success = true;
          },
          function(data) {
            $scope.commited = true;
            $scope.success = false;
          }
        );
      }
    };

    $scope.print = function() { return linkService.print(); };
  }]);
})();
