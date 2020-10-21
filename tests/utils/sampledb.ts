import Category from "model/Category";
import Checkpoint from "model/Checkpoint";
import CheckpointAssignment from "model/CheckpointAssignment";
import GpsLocation from "model/GpsLocation";
import Krok from "model/Krok";
import Participant from "model/Participant";
import Route from "model/Route";
import RouteWater from "model/RouteWater";
import Station from "model/Station";
import Tag from "model/Tag";
import TagAssignment from "model/TagAssignment";
import Team from "model/Team";

import categoryData from "../data/categories";
import krokData from "../data/krok";
import participantData from "../data/participants";
import tagData from "../data/tags";
import tagAssignmentData from "../data/tagAssignment";
import teamData from "../data/teams";
import stationData from "../data/stations";
import gpsLocationData from "../data/gpsLocations";
import checkpointData from "../data/checkpoints";
import checkpointAssignmentData from "../data/checkpointAssignment";
import routeWaterData from "../data/routesWater";

const createCategoryCollection = async () => {
  await Category.insertMany(categoryData);
};

const createKrokCollection = async () => {
  await Krok.insertMany(krokData);
};

const createParticipantCollection = async () => {
  await Participant.insertMany(participantData);
};

const createTagCollection = async () => {
  await Tag.insertMany(tagData);
};

const createTagAssignmentCollection = async () => {
  await TagAssignment.insertMany(tagAssignmentData);
};

const createTeamCollection = async () => {
  await Team.insertMany(teamData);
};

const createStationCollection = async () => {
  await Station.insertMany(stationData);
};

const createGpsLocationCollection = async () => {
  await GpsLocation.insertMany(gpsLocationData);
};

const createCheckpointCollection = async () => {
  await Checkpoint.insertMany(checkpointData);
};

const createCheckpointAssignmentCollection = async () => {
  await CheckpointAssignment.insertMany(checkpointAssignmentData);
};

const createRouteWaterCollection = async () => {
  await RouteWater.insertMany(routeWaterData);
};

const createRouteCollection = async () => {};

export const populateSampleDatabase = async () => {
  await createCategoryCollection();
  await Category.countDocuments({}, (_, count) => {
    console.log("Number of categories: ", count);
  });

  await createKrokCollection();
  await Krok.countDocuments({}, (_, count) => {
    console.log("Number of krok objects: ", count);
  });

  await createParticipantCollection();
  await Participant.countDocuments({}, (_, count) => {
    console.log("Number of participants: ", count);
  });

  await createTagCollection();
  await Tag.countDocuments({}, (_, count) => {
    console.log("Number of tags: ", count);
  });

  await createTagAssignmentCollection();
  await TagAssignment.countDocuments({}, (_, count) => {
    console.log("Number of tag assignments: ", count);
  });

  await createTeamCollection();
  await Team.countDocuments({}, (_, count) => {
    console.log("Number of teams: ", count);
  });

  await createStationCollection();
  await Station.countDocuments({}, (_, count) => {
    console.log("Number of stations: ", count);
  });

  await createGpsLocationCollection();
  await GpsLocation.countDocuments({}, (_, count) => {
    console.log("Number of loctions: ", count);
  });

  await createCheckpointCollection();
  await Checkpoint.countDocuments({}, (_, count) => {
    console.log("Number of checkpoints: ", count);
  });

  await createCheckpointAssignmentCollection();
  await CheckpointAssignment.countDocuments({}, (_, count) => {
    console.log("Number of checkpoint assignments: ", count);
  });

  await createRouteWaterCollection();
  await RouteWater.countDocuments({}, (_, count) => {
    console.log("Number of water routes: ", count);
  });

  await createRouteCollection();
  await Route.countDocuments({}, (_, count) => {
    console.log("Number of forest routes: ", count);
  });
};

export const eraseSampleDatabase = async () => {
  Category.deleteMany({});
  Checkpoint.deleteMany({});
  CheckpointAssignment.deleteMany({});
  GpsLocation.deleteMany({});
  Krok.deleteMany({});
  Participant.deleteMany({});
  Route.deleteMany({});
  RouteWater.deleteMany({});
  Station.deleteMany({});
  Tag.deleteMany({});
  TagAssignment.deleteMany({});
  Team.deleteMany({});
};
