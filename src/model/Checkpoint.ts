import mongoose, { Schema, Document } from "mongoose";
import { IGpsLocation } from "model/GpsLocation";

export interface ICheckpoint extends Document {
  name: string;
  location: IGpsLocation;
  description: string;

  /**
   * True if checkpoint is used for water stage
   */
  water: boolean;

  /**
   * Organizator's notes about the checkpoint
   */
  note: string;

  createdAt: Date;
  updatedAt: Date;
}

export const CheckpointSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    location: {
      type: Schema.Types.ObjectId,
      ref: "GpsLocation",
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    water: {
      type: Boolean,
      required: false,
    },
    note: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model<ICheckpoint>("Checkpoint", CheckpointSchema);
