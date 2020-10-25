import mongoose, { Schema, Document } from "mongoose";
import { ITag } from "model/Tag";
import { IKrok } from "model/Krok";
import { IStation } from "model/Station";

export interface IRouteAction extends Document {
  station: IStation["_id"];
  timestamp: Date;
}

export interface IRoute extends Document {
  tag: ITag["_id"];
  krok: IKrok["_id"];
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
    required: true,
  },
  timestamp: {
    type: Date,
    required: true,
  },
});

export const RouteSchema: Schema = new Schema(
  {
    tag: {
      type: Schema.Types.ObjectId,
      ref: "Tag",
      required: true,
    },
    krok: {
      type: Schema.Types.ObjectId,
      ref: "Krok",
      required: true,
    },
    start: {
      type: Date,
      required: true,
    },
    finish: {
      type: Date,
      required: true,
      validate: {
        validator: function (this: IRoute, value: Date) {
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
