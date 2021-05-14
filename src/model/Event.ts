import mongoose, { Schema, Document } from "mongoose";
import { ILocation } from "model/Location";
import { ICategory } from "model/Category";

export interface IEventDate extends Document {
  start: Date;
  end: Date;
}

export interface IEvent extends Document {
  name: string;
  categories: Array<ICategory["_id"]>;
  date: IEventDate;
  location?: ILocation["_id"];
  createdAt: Date;
  updatedAt: Date;
}

const EventDateSchema: Schema = new Schema({
  start: {
    type: Date,
    required: [true, "Start date is required"],
    unique: true,
  },
  end: {
    type: Date,
    required: [true, "End date is required"],
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
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    categories: {
      type: [Schema.Types.ObjectId],
      ref: "Category",
      required: false,
    },
    date: {
      type: EventDateSchema,
      required: [true, "Start/End date is required"],
      unique: true,
    },
    location: {
      type: Schema.Types.ObjectId,
      ref: "Location",
      required: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IEvent>("Event", EventSchema);
