import mongoose, { Schema, Document } from "mongoose";
import { IKrok } from "model/Krok";
import { ICategory } from "model/Category";
import { ICheckpoint } from "model/CheckPoint";
import { IStation } from "model/Station";

export enum CheckpointCostMetric {
  Points = "points",
  Seconds = "seconds",
  Minutes = "minutes",
  Hours = "hours",
}

export interface ICheckpointAssignment extends Document {
  krok: IKrok["_id"];
  category: ICategory["_id"];
  checkpoint: ICheckpoint["_id"];
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

export const CheckpointAssignmentSchema: Schema = new Schema(
  {
    krok: {
      type: Schema.Types.ObjectId,
      ref: "Krok",
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    checkpoint: {
      type: Schema.Types.ObjectId,
      ref: "Checkpoint",
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

export default mongoose.model<ICheckpointAssignment>(
  "CheckpointAssignment",
  CheckpointAssignmentSchema
);
