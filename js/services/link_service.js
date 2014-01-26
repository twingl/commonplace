( function() {
  'use strict';

  Commonplace.services.factory('linkService', function() {
    // The Link service.
    // This is designed to create links from an `origin` resource (highlight,
    // comment) to one or more `termination` resources.
    var LinkService = (function() {
      var terminations = {};
      var origin = undefined;


      // Constructor
      function LinkService() {};


      // The origin of the link.
      LinkService.origin    = function() { return origin; }


      // FIXME should not need to supply object
      // Set the origin of the link to a resource
      LinkService.setOrigin = function(type, id, object) {
        origin = {
          type:   type,
          id:     id,
          object: object
        }
      };


      // Clear any existing origin and reset to undefined
      LinkService.clearOrigin = function() {
        origin = undefined;
      };


      // Returns the currently staged termination resources
      LinkService.terminations = function() {
        return terminations;
      };


      // FIXME should not need to supply object
      // Stages a link to be created in the "to" pool 
      LinkService.stageTermination = function(type, id, object) {
        var key = type + "-" + id;
        terminations[key] = {
          type:   type,
          id:     id,
          object: object
        };
      };


      // Removes a staged link from the "to" pool
      LinkService.unstageTermination = function(resourceType, resourceId) {
        var key = resourceType + "-" + resourceId;
        delete terminations[key];
      };


      // Removes all staged links from the "to" pool
      LinkService.clearTerminations = function(resourceType, resourceId) {
        terminations = {};
      };


      // Creates links on the server corresponding to what's staged
      LinkService.commitTerminations = function() {
        if (origin !== undefined && Object.keys(terminations).length > 0) {
          //stub
        } else {
          return false;
        }
      };

      return LinkService;
    });

    return new LinkService();
  });

})();
