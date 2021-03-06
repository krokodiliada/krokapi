import mongoose, { Schema, Document } from "mongoose";
import { ITagAssignment } from "model/TagAssignment";
import { IStation } from "model/Station";

export interface IRouteAction extends Document {
  station: IStation["_id"];
  timestamp: Date;
}

export interface IRoute extends Document {
  tagAssignment: ITagAssignment["_id"];
  start: Date;
  finish: Date;
  actions: [IRouteAction];
  createdAt: Date;
  updatedAt: Date;
}

const RouteActionSchema: Schema = new Schema({
  station: {
    type: Schema.Types.ObjectId,
    ref: "Station",
    required: [true, "Station ID is required"],
  },
  timestamp: {
    type: Date,
    required: [true, "Action date/time is required"],
  },
});

export const RouteSchema: Schema = new Schema(
  {
    tagAssignment: {
      type: Schema.Types.ObjectId,
      ref: "TagAssignment",
      required: [true, "Tag assignment ID is required"],
      unique: true,
    },
    start: {
      type: Date,
      required: [true, "Start date/time is required"],
    },
    finish: {
      type: Date,
      required: false,
      validate: {
        validator(this: IRoute, value: Date) {
          return value >= this.start;
        },
        message: () => "Finish timestamp must be later or equal to start one",
      },
    },
    actions: {
      type: [RouteActionSchema],
      required: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IRoute>("Route", RouteSchema);
