import mongoose, { Schema, Document } from "mongoose";
import { IParticipant } from "model/Participant";
import { IKrok } from "model/Krok";
import { ICategory } from "model/Category";

export interface ITeam extends Document {
  name: string;
  participants: IParticipant["_id"];
  krok: IKrok["_id"];
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
    krok: {
      type: Schema.Types.ObjectId,
      ref: "Krok",
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

export default mongoose.model<ITeam>("Team", TeamSchema);
