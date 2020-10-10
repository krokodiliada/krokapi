import mongoose, { Schema, Document } from "mongoose";
import { ITeam } from "model/Team";
import { ICheckpoint } from "model/CheckPoint";

interface IRouteWaterAction extends Document {
  checkpoint: ICheckpoint["_id"];
  timestamp: Date;
  /**
   * Whether the team touched a pole of the checkpoint
   */
  touched: boolean;
}

export interface IRouteWater extends Document {
  team: ITeam["_id"];
  start: Date;
  finish: Date;
  actions: [IRouteWaterAction];
  createdAt: Date;
  updatedAt: Date;
}

const RouteWaterActionSchema: Schema = new Schema({
  station: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  timestamp: {
    type: Date,
    required: true,
  },
});

export const RouteWaterSchema: Schema = new Schema(
  {
    team: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    start: {
      type: Date,
      required: true,
    },
    finish: {
      type: Date,
      required: false,
    },
    actions: {
      type: [RouteWaterActionSchema],
      required: false,
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model<IRouteWater>("RouteWater", RouteWaterSchema);
