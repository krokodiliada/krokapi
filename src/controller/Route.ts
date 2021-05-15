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
    return res.status(StatusCodes.NOT_FOUND).json({
      error: Errors.Routes.DOES_NOT_EXIST,
    });
  }

  return next();
};

const getTagAssignmentById = async (
  assignmentId: string,
  res: Response
): Promise<ITagAssignment | null> => {
  if (assignmentId && !GenericController.isValidObjectId(assignmentId)) {
    res.status(StatusCodes.BAD_REQUEST).json({
      error: `'${assignmentId}' is not a valid tag assignment id`,
    });
    return null;
  }

  const assignment: ITagAssignment | null = await TagAssignment.findById(
    assignmentId
  );

  if (!assignment) {
    res.status(StatusCodes.BAD_REQUEST).json({
      error: Errors.TagAssignments.DOES_NOT_EXIST,
    });
    return null;
  }

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
    res.status(StatusCodes.BAD_REQUEST).json({
      error: `'${assignmentId}' is not a valid tag assignment id`,
    });
    return;
  }

  const assignment: ITagAssignment | null = await TagAssignment.findById(
    assignmentId
  );

  if (assignmentId && !assignment) {
    res.status(StatusCodes.NOT_FOUND).json({
      error: Errors.TagAssignments.DOES_NOT_EXIST,
    });
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

  if (data.tagAssignment) {
    const assignmentId: string = data.tagAssignment as string;
    const tagAssignment = await getTagAssignmentById(assignmentId, res);
    if (!tagAssignment) {
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
    .catch((error) => {
      res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
    });
};

// PATCH /routes/:id
const update: RequestHandler = async (req: Request, res: Response) => {
  const data = req.body;
  const requestedId = req.params.id;

  if (Object.keys(data).length === 0) {
    res.status(StatusCodes.BAD_REQUEST).json({
      error: Errors.EMPTY_REQUEST_BODY,
    });
    return;
  }

  const route: IRoute | null = await Route.findById(requestedId);

  if (data.tagAssignment) {
    const assignmentId: string = data.tagAssignment as string;
    const tagAssignment = await getTagAssignmentById(assignmentId, res);
    if (!tagAssignment) {
      return;
    }
  }

  if (route) {
    route
      .set(data)
      .save()
      .then(() => res.status(StatusCodes.OK).json(route))
      .catch((error) => {
        res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
      });
  }
};

// DELETE /routes/:id
const deleteById: RequestHandler = async (req: Request, res: Response) => {
  const requestedId = req.params.id;

  const route: IRoute | null = await Route.findById(requestedId);

  if (route) {
    Route.deleteOne(route)
      .then(() => res.status(StatusCodes.NO_CONTENT).send())
      .catch(() =>
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          error: Errors.INTERNAL_SERVER_ERROR,
        })
      );
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
          .catch((error) => {
            res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
          });
      } else {
        res.status(StatusCodes.BAD_REQUEST).json({
          error: Errors.Routes.INVALID_ACTIONS,
        });
      }
    })
    .catch((error) => {
      res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
    });
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
