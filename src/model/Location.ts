import mongoose, { Schema, Document } from "mongoose";

export interface ILocation extends Document {
  name: string;
  latitude: number;
  longitude: number;
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

export const LocationSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    latitude: {
      type: Number,
      required: true,
      validate: {
        validator(value: number) {
          return value >= -90.0 && value <= 90.0;
        },
        message: () => "Latitude must be in range [-90.000, +90.000]",
      },
    },
    longitude: {
      type: Number,
      required: true,
      validate: {
        validator(value: number) {
          return value >= -180.0 && value <= 180.0;
        },
        message: () => "Longitude must be in range [-180.000, +180.000]",
      },
    },
    description: {
      type: String,
      required: false,
    },
    water: {
      type: Boolean,
      required: false,
      default: false,
    },
    note: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

LocationSchema.index({ latitude: 1, longitude: 1 }, { unique: true });

export default mongoose.model<ILocation>("Location", LocationSchema);
