import { Request, Response, NextFunction, RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

import GenericController from "controller/Common";

import Team, { ITeam } from "model/Team";
import Krok, { IKrok } from "model/Krok";
import Category, { ICategory } from "model/Category";
import Participant, { IParticipant } from "model/Participant";
import TagAssignment, { ITagAssignment } from "model/TagAssignment";
import Route, { IRoute } from "model/Route";
import RouteWater, { IRouteWater } from "model/RouteWater";

const validateTeamExists: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestedTeamId = req.params.id;

  const team: ITeam | null = await Team.findById(requestedTeamId);

  if (!team) {
    return res.status(StatusCodes.NOT_FOUND).json({});
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
 * Check if participants assigned to the team are unique among the same krok.
 * One participant cannot be assigned to multiple teams.
 * @param team Team to check
 */
const areParticipantsUniqueForTeam = async (team: ITeam): Promise<boolean> => {
  const { participants } = team;

  const teams: Array<ITeam> = await Team.find()
    .where({
      krok: team.krok,
    })
    .where({
      participants: { $in: participants },
    })
    .where({
      _id: { $ne: team._id },
    });

  return teams.length === 0;
};

const isTeamValid = async (team: ITeam): Promise<boolean> => {
  return team
    .validate()
    .then(async () => {
      const teamSizeValid: boolean = await isValidTeamSize(team);

      if (!teamSizeValid) {
        throw new Error("The team does not have a valid size");
      }

      const teamHasUniqueParticipants: boolean = await areParticipantsUniqueForTeam(
        team
      );

      if (!teamHasUniqueParticipants) {
        throw new Error("The team shares participants with another team");
      }

      const krok: IKrok | null = await Krok.findById(team.krok);
      const category: ICategory | null = await Category.findById(team.category);

      if (!krok || !category) {
        throw new Error("Either krok or category id does not exist");
      }

      return true;
    })
    .catch(() => {
      return false;
    });
};

interface ParticipantAndKrokParameters {
  participant: string;
  krok: string;
}

const getByParticipantAndKrok = async ({
  participant,
  krok,
}: ParticipantAndKrokParameters): Promise<ITeam | null> => {
  const teams: Array<ITeam> = await Team.find().where(participant).where(krok);

  if (teams.length === 0) {
    return null;
  }

  return teams[0];
};

interface KrokCategoryFilter {
  krok?: unknown;
  category?: unknown;
}

// GET /teams/
const getAll: RequestHandler = async (req: Request, res: Response) => {
  const krokId: string = req.query.krok as string;
  const categoryId: string = req.query.category as string;

  if (
    (krokId && !GenericController.isValidObjectId(krokId)) ||
    (categoryId && !GenericController.isValidObjectId(categoryId))
  ) {
    res.status(StatusCodes.BAD_REQUEST).json({});
    return;
  }

  const krok: IKrok | null = await Krok.findById(krokId);
  const category: ICategory | null = await Category.findById(categoryId);

  if ((krokId && !krok) || (categoryId && !category)) {
    res.status(StatusCodes.NOT_FOUND).json({});
    return;
  }

  const filter: KrokCategoryFilter = {};

  if (krok) {
    filter.krok = { $in: krok._id };
  }

  if (category) {
    filter.category = { $in: category._id };
  }

  const teams: Array<ITeam> = await Team.find(filter);
  res.status(StatusCodes.OK).json(teams);
};

// GET /teams/:id
const getById: RequestHandler = async (req: Request, res: Response) => {
  const requestedTeamId = req.params.id;

  const team: ITeam | null = await Team.findById(requestedTeamId);

  if (team) {
    res.status(StatusCodes.OK).json(team);
  }
};

// PUT /teams/
const create: RequestHandler = async (req: Request, res: Response) => {
  const data = req.body;

  const newTeam: ITeam = new Team(data);
  const isValid: boolean = await isTeamValid(newTeam);

  if (!isValid) {
    res.status(StatusCodes.BAD_REQUEST).json({});
    return;
  }

  Team.create(newTeam)
    .then((team: ITeam) =>
      res
        .status(StatusCodes.CREATED)
        .set("Location", `/teams/${team._id}`)
        .json(team)
    )
    .catch(() => res.status(StatusCodes.BAD_REQUEST).json({}));
};

// PATCH /teams/:id
const update: RequestHandler = async (req: Request, res: Response) => {
  const requestedTeamId = req.params.id;

  const team: ITeam | null = await Team.findById(requestedTeamId);

  if (!team) {
    return;
  }

  team.set(req.body);
  const isValid: boolean = await isTeamValid(team);

  if (!isValid) {
    res.status(StatusCodes.BAD_REQUEST).json({});
    return;
  }

  team
    .save()
    .then(() => res.status(StatusCodes.OK).json())
    .catch(() => res.status(StatusCodes.BAD_REQUEST).json({}));
};

// DELETE /teams/:id
const deleteById: RequestHandler = async (req: Request, res: Response) => {
  const requestedTeamId = req.params.id;

  const team: ITeam | null = await Team.findById(requestedTeamId);

  if (team) {
    Team.deleteOne(team)
      .then(() => res.status(StatusCodes.OK).json({}))
      .catch(() => res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({}));
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

  const team: ITeam | null = await Team.findById(requestedTeamId);

  if (!team) {
    return;
  }

  const participantIds = team.participants;

  const assignments: Array<ITagAssignment> = await TagAssignment.find().where({
    participant: { $in: participantIds },
  });
  const assignmentIds: Array<string> = assignments.map(
    (assignment) => assignment._id
  );

  const routes: Array<IRoute> = await Route.find().where({
    tagAssignment: { $in: assignmentIds },
  });

  res.status(StatusCodes.OK).json({ route: routes });
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

  res.status(StatusCodes.OK).json({ route: routeWater });
};

export default {
  validateTeamExists,
  getAll,
  getById,
  getByParticipantAndKrok,
  create,
  update,
  deleteById,
  getParticipants,
  getRoute,
  getWaterRoute,
};
