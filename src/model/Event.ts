import mongoose, { Schema, Document } from "mongoose";
import { IGpsLocation } from "model/GpsLocation";
import { ICategory } from "model/Category";

export interface IEventDate extends Document {
  start: Date;
  end: Date;
}

export interface IEvent extends Document {
  number: number;
  categories: Array<ICategory["_id"]>;
  season: string;
  date: IEventDate;
  location?: IGpsLocation["_id"];
  createdAt: Date;
  updatedAt: Date;
}

const EventDateSchema: Schema = new Schema({
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
      validator(this: IEventDate, value: Date) {
        return value >= this.start;
      },
      message: () => "End date must be later or equal to start date",
    },
  },
});

export const EventSchema: Schema = new Schema(
  {
    number: {
      type: Number,
      required: true,
      unique: true,
    },
    categories: {
      type: [Schema.Types.ObjectId],
      ref: "Category",
      required: false,
    },
    season: {
      type: String,
      required: false,
      default(this: IEvent) {
        return this.number % 2 === 0 ? "fall" : "spring";
      },
      enum: ["fall", "spring"],
    },
    date: {
      type: EventDateSchema,
      required: true,
      unique: true,
    },
    location: {
      type: Schema.Types.ObjectId,
      ref: "GpsLocation",
      required: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IEvent>("Event", EventSchema);
