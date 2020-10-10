import mongoose, { Schema, Document } from "mongoose";

export interface IStation extends Document {
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const StationSchema: Schema = new Schema(
  {
    enabled: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IStation>("Station", StationSchema);
