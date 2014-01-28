( function() {
  'use strict';

  Commonplace.services.factory('linkService', ['$http', function($http) {
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
        var that = this;
        var keys = Object.keys(terminations);
        if (origin !== undefined && keys.length > 0) {
          for (var i = 0; i < keys.length; i++) {
            var termination = terminations[keys[i]];
            var link = {
              start_id:   origin.id,
              start_type: origin.type,
              end_id:     termination.id,
              end_type:   termination.type
            };
            $http.post('http://api.twin.gl/v1/twinglings', link)
              .success(function(data) {
                that.unstageTermination(termination.type, termination.id);
                // If we have cleared all of our terminations, remove the origin
                if (Object.keys(terminations).length === 0) that.clearOrigin();
              });
          }
        } else {
          return false;
        }
      };

      return LinkService;
    });

    return new LinkService();
  }]);

})();
