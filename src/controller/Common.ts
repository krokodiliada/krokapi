import { Request, Response, RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

const disallowMethod: RequestHandler = async (_: Request, res: Response) => {
  res.status(StatusCodes.METHOD_NOT_ALLOWED).json({});
};

export default { disallowMethod };
