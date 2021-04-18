import mongoose, { Schema, Document } from "mongoose";
import { IEvent } from "model/Event";
import { ICategory } from "model/Category";
import { ILocation } from "model/Location";
import { IStation } from "model/Station";

export enum CheckpointCostMetric {
  Points = "points",
  Seconds = "seconds",
  Minutes = "minutes",
  Hours = "hours",
}

export interface ICheckpoint extends Document {
  event: IEvent["_id"];
  category: ICategory["_id"];
  location: ILocation["_id"];
  station: IStation["_id"];
  required: boolean;

  /**
   * @brief Check whether the checkpoint is linear or not.
   * @details If true, then @p order field will be used to check the order of
   * checkpoints. If false, then the order of this checkpoint does not matter
   * and it won't be used to check the correctness of the route in @p category.
   */
  checkOrder: boolean;

  /**
   * Number of the @p checkpoint in the route assigned to the @p category
   */
  order: number;

  /**
   * How much of bonus points the team receives if they take this checkpoint.
   */
  cost: number;
  costMetric: CheckpointCostMetric;

  createdAt: Date;
  updatedAt: Date;
}

export const CheckpointSchema: Schema = new Schema(
  {
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    location: {
      type: Schema.Types.ObjectId,
      ref: "Location",
      required: true,
    },
    station: {
      type: Schema.Types.ObjectId,
      ref: "Station",
      required: false,
    },
    required: {
      type: Boolean,
      required: false,
      default: true,
    },
    checkOrder: {
      type: Boolean,
      required: false,
      default: true,
    },
    order: {
      type: Number,
      required: false,
    },
    cost: {
      type: Number,
      required: false,
    },
    costMetric: {
      type: String,
      default: CheckpointCostMetric.Seconds,
      enum: Object.values(CheckpointCostMetric),
    },
  },
  { timestamps: true }
);

export default mongoose.model<ICheckpoint>("Checkpoint", CheckpointSchema);
