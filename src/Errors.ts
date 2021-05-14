export default {
  EMPTY_REQUEST_BODY: "Empty request body is received",
  INTERNAL_SERVER_ERROR:
    "Internal server error. Contact a system administrator",
  Categories: {
    CANT_CHANGE_PARTICIPANTS_NUMBER:
      "Cannot change participants number for this category " +
      "because it will affect existing teams. " +
      "Consider creating a new category instead.",
    CANT_CHANGE_TIME_OR_CHECKPOINTS:
      "Cannot change category max time or minimum number of checkpoints " +
      "because it will affect the results of previous competitions. " +
      "Consider creating a new category instead.",
    DOES_NOT_EXIST: "Category with this id does not exist",
    CATEGORY_IN_USE:
      "Cannot delete category because it is being used, e.g. " +
      "a team is already registered in this category " +
      "or a checkpoint was already assigned to this category. " +
      "Make sure it is not used anywhere before deleting it.",
  },
  Checkpoints: {
    DOES_NOT_EXIST: "Checkpoint with this id does not exist",
  },
  Events: {
    CATEGORY_DOES_NOT_EXIST: "Category with this id does not exist",
    DOES_NOT_EXIST: "Event with this id does not exist",
    DOES_NOT_HAVE_CATEGORY: "Event does not have a category with this id",
    LOCATION_DOES_NOT_EXIST: "Location with this id does not exist",
    LOCATION_IS_NOT_ASSIGNED: "No location assigned to this event",
  },
  Locations: {
    DOES_NOT_EXIST: "Location with this id does not exist",
  },
  Participants: {
    DOES_NOT_EXIST: "Participant with this id does not exist",
  },
  Routes: {
    DOES_NOT_EXIST: "Route with this id does not exist",
    INVALID_ACTIONS:
      "Some actions are invalid. " +
      "Check that all stations have valid and existent identifiers",
  },
  Stations: {
    DOES_NOT_EXIST: "Station with this id does not exist",
  },
  TagAssignments: {
    CANNOT_GENERATE_TAG_NUMBER: "Cannot generate a tag number",
    DOES_NOT_EXIST: "Tag assignment with this id does not exist",
    EVENT_AND_PARTICIPANT_REQUIRED:
      "Both `event` and `participant` parameters are required",
  },
  Teams: {
    DOES_NOT_EXIST: "Team with this id does not exist",
  },
};
