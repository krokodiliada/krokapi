import mongoose, { Schema, Document } from "mongoose";

export interface IKrokLocation extends Document {
  name: string;
  latitude: number;
  longitude: number;
}

export interface IKrokDate extends Document {
  start: Date;
  end: Date;
}

export interface IKrok extends Document {
  number: number;
  season: string;
  date: IKrokDate;
  location: IKrokLocation;
  createdAt: Date;
  updatedAt: Date;
}

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
      start: {
        type: Date,
        required: true,
      },
      end: {
        type: Date,
        required: true,
        validate: {
          validator: function (this: IKrok, value: Date) {
            return value <= this.date.start;
          },
          message: () => "End date must be later or equal to start date",
        },
      },
    },
    location: {
      name: {
        type: String,
        required: false,
      },
      latitude: {
        type: Number,
        required: false,
      },
      longitude: {
        type: Number,
        required: false,
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model<IKrok>("Krok", KrokSchema);
