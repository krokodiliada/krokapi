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
