import mongoose, { Schema, Document } from "mongoose";
import { IGpsLocation } from "model/GpsLocation";

export interface IKrokDate extends Document {
  start: Date;
  end: Date;
}

export interface IKrok extends Document {
  number: number;
  season: string;
  date: IKrokDate;
  location: IGpsLocation;
  createdAt: Date;
  updatedAt: Date;
}

const KrokDateSchema: Schema = new Schema({
  start: {
    type: Date,
    required: true,
    unique: true,
  },
  end: {
    type: Date,
    required: true,
    unique: true,
    validate: {
      validator: function (this: IKrokDate, value: Date) {
        return value >= this.start;
      },
      message: () => "End date must be later or equal to start date",
    },
  },
});

export const KrokSchema: Schema = new Schema(
  {
    number: {
      type: Number,
      required: true,
      unique: true,
    },
    season: {
      type: String,
      required: false,
      default: function (this: IKrok) {
        return this.number % 2 == 0 ? "fall" : "spring";
      },
    },
    date: {
      type: KrokDateSchema,
      required: true,
      unique: true,
    },
    location: {
      type: Schema.Types.ObjectId,
      required: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IKrok>("Krok", KrokSchema);
