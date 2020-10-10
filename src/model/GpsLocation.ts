import mongoose, { Schema, Document } from "mongoose";

export interface IGpsLocation extends Document {
  name: string;
  latitude: number;
  longitude: number;
  createdAt: Date;
  updatedAt: Date;
}

export const GpsLocationSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IGpsLocation>("GpsLocation", GpsLocationSchema);
