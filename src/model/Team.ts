import mongoose, { Schema, Document } from "mongoose";
import { IParticipant } from "model/Participant";
import { IEvent } from "model/Event";
import { ICategory } from "model/Category";

export interface ITeam extends Document {
  name: string;
  participants: IParticipant["_id"];
  event: IEvent["_id"];
  category: ICategory["_id"];
  extraMapRequired: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const TeamSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    participants: {
      type: [Schema.Types.ObjectId],
      ref: "Participant",
      required: true,
    },
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    extraMapRequired: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  { timestamps: true }
);

TeamSchema.index({ name: 1, event: 1 }, { unique: true });

export default mongoose.model<ITeam>("Team", TeamSchema);
