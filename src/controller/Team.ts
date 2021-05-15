import { Request, Response, NextFunction, RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

import GenericController from "controller/Common";

import Team, { ITeam } from "model/Team";
import Event, { IEvent } from "model/Event";
import Category, { ICategory } from "model/Category";
import Participant, { IParticipant } from "model/Participant";
import TagAssignment, { ITagAssignment } from "model/TagAssignment";
import Route, { IRoute } from "model/Route";
import RouteWater, { IRouteWater } from "model/RouteWater";
import Errors from "Errors";
import utils from "utils";

const validateTeamExists: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestedTeamId = req.params.id;

  const team: ITeam | null = await Team.findById(requestedTeamId);

  if (!team) {
    return res.status(StatusCodes.NOT_FOUND).json({
      error: Errors.Teams.DOES_NOT_EXIST,
    });
  }

  return next();
};

/**
 * Check that the team size is valid for the category it is registered in.
 * @param team Team to check
 */
const isValidTeamSize = async (team: ITeam): Promise<boolean> => {
  const teamSize: number = team.participants.length;
  const categoryId: string = team.category;

  const category: ICategory | null = await Category.findById(categoryId);

  if (
    !category ||
    teamSize < category.participantsNumber.min ||
    teamSize > category.participantsNumber.max
  ) {
    return false;
  }

  return true;
};

/**
 * Check if participants assigned to the team are unique among the same event.
 * One participant cannot be assigned to multiple teams.
 * @param team Team to check
 */
const areParticipantsUniqueForTeam = async (team: ITeam): Promise<boolean> => {
  const { participants } = team;

  const teams: Array<ITeam> = await Team.find()
    .where({
      event: team.event,
    })
    .where({
      participants: { $in: participants },
    })
    .where({
      _id: { $ne: team._id },
    });

  return teams.length === 0;
};

const isTeamValid = async (res: Response, team: ITeam): Promise<boolean> => {
  return team
    .validate()
    .then(async () => {
      const event: IEvent | null = await Event.findById(team.event);

      if (!event) {
        res.status(StatusCodes.BAD_REQUEST).json({
          error: Errors.Events.DOES_NOT_EXIST,
        });

        return false;
      }

      const category: ICategory | null = await Category.findById(team.category);

      if (!category) {
        res.status(StatusCodes.BAD_REQUEST).json({
          error: Errors.Categories.DOES_NOT_EXIST,
        });

        return false;
      }

      const teamSizeValid: boolean = await isValidTeamSize(team);
      if (!teamSizeValid) {
        res.status(StatusCodes.BAD_REQUEST).json({
          error: Errors.Teams.INVALID_PARTICIPANTS_NUMBER,
        });

        return false;
      }

      const teamHasUniqueParticipants: boolean = await areParticipantsUniqueForTeam(
        team
      );
      if (!teamHasUniqueParticipants) {
        res.status(StatusCodes.BAD_REQUEST).json({
          error: Errors.Teams.NOT_UNIQUE_PARTICIPANTS,
        });

        return false;
      }

      return true;
    })
    .catch((error) => {
      res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });

      return false;
    });
};

const getTeamRoutes = async (team: ITeam): Promise<Array<IRoute>> => {
  // It's not really a list of participant ids we expect but rather
  // participant objects themselves
  const participantIds = team.participants.map(
    (participant: IParticipant) => participant._id
  );
  const eventId = team.event;

  const assignments: Array<ITagAssignment> = await TagAssignment.find()
    .where({ participant: participantIds })
    .where({ event: eventId });
  const assignmentIds: Array<string> = assignments.map(
    (assignment) => assignment._id
  );

  const routes: Array<IRoute> = await Route.find().where({
    tagAssignment: assignmentIds,
  });

  return routes;
};

interface ParticipantAndEventParameters {
  participant: string;
  event: string;
}

const getByParticipantAndEvent = async ({
  participant,
  event,
}: ParticipantAndEventParameters): Promise<ITeam | null> => {
  const teams: Array<ITeam> = await Team.find().where(participant).where(event);

  if (teams.length === 0) {
    return null;
  }

  return teams[0];
};

interface EventCategoryFilter {
  event?: unknown;
  category?: unknown;
}

// GET /teams/
const getAll: RequestHandler = async (req: Request, res: Response) => {
  const eventId: string = req.query.event as string;
  const categoryId: string = req.query.category as string;

  if (eventId && !GenericController.isValidObjectId(eventId)) {
    res.status(StatusCodes.BAD_REQUEST).json({
      error: `'${eventId}' is not a valid event id`,
    });
    return;
  }

  if (categoryId && !GenericController.isValidObjectId(categoryId)) {
    res.status(StatusCodes.BAD_REQUEST).json({
      error: `'${categoryId}' is not a valid category id`,
    });
    return;
  }

  const event: IEvent | null = await Event.findById(eventId);
  if (eventId && !event) {
    res.status(StatusCodes.NOT_FOUND).json({
      error: Errors.Events.DOES_NOT_EXIST,
    });
    return;
  }

  const category: ICategory | null = await Category.findById(categoryId);
  if (categoryId && !category) {
    res.status(StatusCodes.NOT_FOUND).json({
      error: Errors.Categories.DOES_NOT_EXIST,
    });
    return;
  }

  const filter: EventCategoryFilter = {};

  if (event) {
    filter.event = { $in: event._id };
  }

  if (category) {
    filter.category = { $in: category._id };
  }

  const teams: Array<ITeam> = await Team.find(filter)
    .populate("category")
    .populate({
      path: "participants",
      model: "Participant",
    })
    .lean();

  const teamsWithRoutes = await Promise.all(
    teams.map(async (team) => {
      const result = team;
      result.routes = await getTeamRoutes(team);
      return result;
    })
  );

  res.status(StatusCodes.OK).json(teamsWithRoutes);
};

// GET /teams/:id
const getById: RequestHandler = async (req: Request, res: Response) => {
  const requestedTeamId = req.params.id;

  const team: ITeam | null = await Team.findById(requestedTeamId)
    .populate("category")
    .populate({
      path: "participants",
      model: "Participant",
    })
    .lean();

  if (team) {
    team.routes = await getTeamRoutes(team);
    res.status(StatusCodes.OK).json(team);
  }
};

// PUT /teams/
const create: RequestHandler = async (req: Request, res: Response) => {
  const data = req.body;
  const version = utils.extractVersionFromUrl(req.originalUrl);

  if (Object.keys(data).length === 0) {
    res.status(StatusCodes.BAD_REQUEST).json({
      error: Errors.EMPTY_REQUEST_BODY,
    });
    return;
  }

  const newTeam: ITeam = new Team(data);
  const isValid: boolean = await isTeamValid(res, newTeam);

  if (!isValid) {
    return;
  }

  Team.create(newTeam)
    .then((team: ITeam) =>
      res
        .status(StatusCodes.CREATED)
        .set("Location", `/${version}/teams/${team._id}`)
        .json(team)
    )
    .catch((error) => {
      res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
    });
};

// PATCH /teams/:id
const update: RequestHandler = async (req: Request, res: Response) => {
  const requestedTeamId = req.params.id;

  if (Object.keys(req.body).length === 0) {
    res.status(StatusCodes.BAD_REQUEST).json({
      error: Errors.EMPTY_REQUEST_BODY,
    });
    return;
  }

  const team: ITeam | null = await Team.findById(requestedTeamId);

  if (!team) {
    return;
  }

  team.set(req.body);
  const isValid: boolean = await isTeamValid(res, team);

  if (!isValid) {
    return;
  }

  team
    .save()
    .then(() => res.status(StatusCodes.OK).json(team))
    .catch((error) => {
      res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
    });
};

// DELETE /teams/:id
const deleteById: RequestHandler = async (req: Request, res: Response) => {
  const requestedTeamId = req.params.id;

  const team: ITeam | null = await Team.findById(requestedTeamId);

  if (team) {
    Team.deleteOne(team)
      .then(() => res.status(StatusCodes.NO_CONTENT).send())
      .catch(() =>
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          error: Errors.INTERNAL_SERVER_ERROR,
        })
      );
  }
};

// GET /teams/:id/participants
const getParticipants: RequestHandler = async (req: Request, res: Response) => {
  const requestedTeamId = req.params.id;

  const team: ITeam | null = await Team.findById(requestedTeamId);

  if (!team) {
    return;
  }

  const participantIds = team.participants;

  const participants: Array<IParticipant> = await Participant.find().where({
    _id: { $in: participantIds },
  });

  res.status(StatusCodes.OK).json(participants);
};

// GET /teams/:id/route
const getRoute: RequestHandler = async (req: Request, res: Response) => {
  const requestedTeamId = req.params.id;

  const team: ITeam | null = await Team.findById(requestedTeamId).populate({
    path: "participants",
    model: "Participant",
  });

  if (!team) {
    return;
  }

  const routes: Array<IRoute> = await getTeamRoutes(team);

  res.status(StatusCodes.OK).json(routes);
};

// GET /teams/:id/route-water
const getWaterRoute: RequestHandler = async (req: Request, res: Response) => {
  const requestedTeamId = req.params.id;

  const team: ITeam | null = await Team.findById(requestedTeamId);

  if (!team) {
    return;
  }

  const routeWater: IRouteWater | null = await RouteWater.findOne().where({
    team: team._id,
  });

  res.status(StatusCodes.OK).json(routeWater || {});
};

export default {
  validateTeamExists,
  getAll,
  getById,
  getByParticipantAndEvent,
  create,
  update,
  deleteById,
  getParticipants,
  getRoute,
  getWaterRoute,
};
