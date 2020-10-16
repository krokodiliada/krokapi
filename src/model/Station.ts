import mongoose, { Schema, Document } from "mongoose";

export interface IStation extends Document {
  number: number;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const StationSchema: Schema = new Schema(
  {
    number: {
      type: Number,
      required: true,
      unique: true,
    },
    enabled: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IStation>("Station", StationSchema);
