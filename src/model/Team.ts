import mongoose, { Schema, Document } from "mongoose";
import { IParticipant } from "model/Participant";
import { IKrok } from "model/Krok";
import { ICategory } from "model/Category";

export interface ITeam extends Document {
  participants: IParticipant["_id"];
  krok: IKrok["_id"];
  category: ICategory["_id"];
  extraMapRequired: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const TeamSchema: Schema = new Schema(
  {
    participants: {
      type: [Schema.Types.ObjectId],
      required: true,
    },
    krok: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
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
