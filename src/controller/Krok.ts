import { Request, Response, NextFunction } from "express";
import Krok from "model/Krok";

const create = (req: Request, res: Response, next: NextFunction) => {
  Krok.create(req.body)
    .then((krok) => res.json(krok))
    .catch(next);
};

const getByNumber = (req: Request, res: Response, next: NextFunction) => {
  console.log("Trying to get the krok by number!");
  Krok.find(req.body)
    .then((krok) => res.status(200).json(krok))
    .catch(next);
};

const deleteByNumber = (req: Request, res: Response, next: NextFunction) => {
  Krok.find(req.body)
    .then((krok) => res.json(krok))
    .catch(next);
};

export { create, getByNumber, deleteByNumber };
