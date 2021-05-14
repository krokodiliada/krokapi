import mongoose from "mongoose";
import { Request, Response, RequestHandler, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

/**
 * Validate that requested id is a valid MongoDB Object Id.
 * Return status 400 (BAD_REQUEST) if id is invalid.
 */
const validateObjectId: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // We suppose that the requested id parameter is the last
  // parameter in the list
  const params = Object.keys(req.params);
  const requestedParameterName = params[params.length - 1];
  const requestedId = req.params[requestedParameterName];

  const { ObjectId } = mongoose.Types;
  if (!ObjectId.isValid(requestedId)) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: `'${requestedId}' is not a valid object id`,
    });
  }

  return next();
};

const isValidObjectId = (id: string): boolean => {
  const { ObjectId } = mongoose.Types;

  if (!ObjectId.isValid(id)) {
    return false;
  }

  return true;
};

const validateNumber: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestedNumber = Number(req.params.number);

  if (Number.isNaN(requestedNumber)) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: `${req.params.number} is not a number`,
    });
  }

  return next();
};

const disallowMethod: RequestHandler = async (
  _: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(StatusCodes.METHOD_NOT_ALLOWED).json({
    error: "Method is not allowed. Check the API documentation",
  });

  return next();
};

export default {
  validateObjectId,
  isValidObjectId,
  validateNumber,
  disallowMethod,
};
