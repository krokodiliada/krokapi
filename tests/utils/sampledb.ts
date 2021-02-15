import Category from "model/Category";
import Checkpoint from "model/Checkpoint";
import CheckpointAssignment from "model/CheckpointAssignment";
import GpsLocation from "model/GpsLocation";
import Event from "model/Event";
import Participant from "model/Participant";
import Route from "model/Route";
import RouteWater from "model/RouteWater";
import Station from "model/Station";
import TagAssignment from "model/TagAssignment";
import Team from "model/Team";

import categoryData from "../data/categories";
import eventData from "../data/events";
import participantData from "../data/participants";
import tagAssignmentData from "../data/tagAssignment";
import teamData from "../data/teams";
import stationData from "../data/stations";
import gpsLocationData from "../data/gpsLocations";
import checkpointData from "../data/checkpoints";
import checkpointAssignmentData from "../data/checkpointAssignment";
import routeWaterData from "../data/routesWater";
import routeData from "../data/routes";

const createCategoryCollection = async () => {
  await Category.insertMany(categoryData);
};

const createEventCollection = async () => {
  await Event.insertMany(eventData);
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

const createRouteCollection = async () => {
  await Route.insertMany(routeData);
};

export const populateSampleDatabase = async (): Promise<void> => {
  await createCategoryCollection();
  await createEventCollection();
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

export const eraseSampleDatabase = async (): Promise<void> => {
  await Category.deleteMany({});
  await Checkpoint.deleteMany({});
  await CheckpointAssignment.deleteMany({});
  await GpsLocation.deleteMany({});
  await Event.deleteMany({});
  await Participant.deleteMany({});
  await Route.deleteMany({});
  await RouteWater.deleteMany({});
  await Station.deleteMany({});
  await TagAssignment.deleteMany({});
  await Team.deleteMany({});
};
