import Category from "model/Category";
import Checkpoint from "model/Checkpoint";
import CheckpointAssignment from "model/CheckpointAssignment";
import GpsLocation from "model/GpsLocation";
import Krok from "model/Krok";
import Participant from "model/Participant";
import Route from "model/Route";
import RouteWater from "model/RouteWater";
import Station from "model/Station";
import TagAssignment from "model/TagAssignment";
import Team from "model/Team";

import categoryData from "../data/categories";
import krokData from "../data/krok";
import participantData from "../data/participants";
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
  await createKrokCollection();
  await createParticipantCollection();
  await createTagAssignmentCollection();
  await createTeamCollection();
  await createStationCollection();
  await createGpsLocationCollection();
  await createCheckpointCollection();
  await createCheckpointAssignmentCollection();
  await createRouteWaterCollection();
  await createRouteCollection();
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
  TagAssignment.deleteMany({});
  Team.deleteMany({});
};
