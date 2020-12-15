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
  const requestedId = req.params.id;

  const { ObjectId } = mongoose.Types;
  if (!ObjectId.isValid(requestedId)) {
    return res.status(StatusCodes.BAD_REQUEST).json({});
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
    return res.status(StatusCodes.BAD_REQUEST).json({});
  }

  return next();
};

const disallowMethod: RequestHandler = async (_: Request, res: Response) => {
  res.status(StatusCodes.METHOD_NOT_ALLOWED).json({});
};

export default {
  validateObjectId,
  isValidObjectId,
  validateNumber,
  disallowMethod,
};
