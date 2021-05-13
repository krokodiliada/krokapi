import { Request, Response, NextFunction, RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

import GenericController from "controller/Common";

import Route, { IRoute, IRouteAction } from "model/Route";
import TagAssignment, { ITagAssignment } from "model/TagAssignment";
import Station, { IStation } from "model/Station";
import Errors from "Errors";
import utils from "utils";

const validateRouteExists: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestedId = req.params.id;

  const route: IRoute | null = await Route.findById(requestedId);

  if (!route) {
    return res.status(StatusCodes.NOT_FOUND).json({});
  }

  return next();
};

const getTagAssignmentById = async (
  assignmentId: string
): Promise<ITagAssignment | null> => {
  if (assignmentId && !GenericController.isValidObjectId(assignmentId)) {
    return null;
  }

  const assignment: ITagAssignment | null = await TagAssignment.findById(
    assignmentId
  );

  return assignment;
};

const areActionsValid = async (
  actions: Array<IRouteAction>
): Promise<boolean> => {
  const results: Array<boolean> = await Promise.all(
    actions.map(async (action) => {
      const stationId: string = action.station;
      const station: IStation | null = await Station.findById(stationId);
      return station !== null;
    })
  );

  return results.every((result) => result === true);
};

// GET /routes/
const getAll: RequestHandler = async (req: Request, res: Response) => {
  let filter = {};

  const assignmentId: string = req.query.tagAssignment as string;

  if (assignmentId && !GenericController.isValidObjectId(assignmentId)) {
    res.status(StatusCodes.BAD_REQUEST).json({});
    return;
  }

  const assignment: ITagAssignment | null = await TagAssignment.findById(
    assignmentId
  );

  if (assignmentId && !assignment) {
    res.status(StatusCodes.NOT_FOUND).json({});
    return;
  }

  if (assignment) {
    filter = {
      tagAssignment: assignmentId,
    };
  }

  const routes: Array<IRoute> = await Route.find(filter);
  res.status(StatusCodes.OK).json(routes);
};

// GET /routes/:id
const getById: RequestHandler = async (req: Request, res: Response) => {
  const requestedId = req.params.id;

  const route: IRoute | null = await Route.findById(requestedId);

  if (route) {
    res.status(StatusCodes.OK).json(route);
  }
};

// POST /routes/
const create: RequestHandler = async (req: Request, res: Response) => {
  const data = req.body;
  const version = utils.extractVersionFromUrl(req.originalUrl);

  if ("tagAssignment" in data) {
    const assignmentId: string = data.tagAssignment as string;
    const tagAssignment = await getTagAssignmentById(assignmentId);
    if (!tagAssignment) {
      res.status(StatusCodes.BAD_REQUEST).json({});
      return;
    }
  }

  const newRoute: IRoute = new Route(data);

  Route.create(newRoute)
    .then((route: IRoute) =>
      res
        .status(StatusCodes.CREATED)
        .set("Location", `/${version}/routes/${route._id}`)
        .json(route)
    )
    .catch(() => res.status(StatusCodes.BAD_REQUEST).json({}));
};

// PATCH /routes/:id
const update: RequestHandler = async (req: Request, res: Response) => {
  const requestedId = req.params.id;

  if (Object.keys(req.body).length === 0) {
    res.status(StatusCodes.BAD_REQUEST).json({
      error: Errors.EMPTY_REQUEST_BODY,
    });
    return;
  }

  const route: IRoute | null = await Route.findById(requestedId);

  if ("tagAssignment" in req.body) {
    const assignmentId: string = req.body.tagAssignment as string;
    const tagAssignment = await getTagAssignmentById(assignmentId);
    if (!tagAssignment) {
      return;
    }
  }

  if (route) {
    route
      .set(req.body)
      .save()
      .then(() => res.status(StatusCodes.OK).json(route))
      .catch(() => res.status(StatusCodes.BAD_REQUEST).json({}));
  }
};

// DELETE /routes/:id
const deleteById: RequestHandler = async (req: Request, res: Response) => {
  const requestedId = req.params.id;

  const route: IRoute | null = await Route.findById(requestedId);

  if (route) {
    Route.deleteOne(route)
      .then(() => res.status(StatusCodes.NO_CONTENT).send())
      .catch(() => res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({}));
  }
};

// PUT /routes/:id/actions
const createActions: RequestHandler = async (req: Request, res: Response) => {
  const requestedId = req.params.id;
  const version = utils.extractVersionFromUrl(req.originalUrl);

  const route: IRoute | null = await Route.findById(requestedId);

  if (!route) {
    return;
  }

  route
    .set(req.body)
    .validate()
    .then(async () => {
      const actionsValid = await areActionsValid(route.actions);

      if (actionsValid) {
        route
          .save()
          .then(() =>
            res
              .status(StatusCodes.OK)
              .set("Location", `/${version}/routes/${route._id}`)
              .json(route)
          )
          .catch(() => res.status(StatusCodes.BAD_REQUEST).json({}));
      } else {
        res.status(StatusCodes.BAD_REQUEST).json();
      }
    })
    .catch(() => res.status(StatusCodes.BAD_REQUEST).json({}));
};

export default {
  validateRouteExists,
  getAll,
  getById,
  create,
  update,
  deleteById,
  createActions,
};
