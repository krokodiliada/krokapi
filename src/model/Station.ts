import mongoose, { Schema, Document } from "mongoose";

export enum StationType {
  Regular = "regular",
  Clear = "clear",
  Start = "start",
  Finish = "finish",
}

export interface IStation extends Document {
  number: number;
  enabled: boolean;
  stationType: StationType;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const StationSchema: Schema = new Schema(
  {
    number: {
      type: Number,
      required: [true, "Station number is required"],
      unique: true,
    },
    enabled: {
      type: Boolean,
      required: false,
      default: true,
    },
    stationType: {
      type: String,
      required: false,
      default: StationType.Regular,
      enum: Object.values(StationType),
    },
    notes: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IStation>("Station", StationSchema);
