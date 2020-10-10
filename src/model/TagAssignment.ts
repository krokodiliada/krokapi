import mongoose, { Schema, Document } from "mongoose";
import { IParticipant } from "model/Participant";
import { IKrok } from "model/Krok";
import { ITag } from "model/Tag";

export interface ITagAssignment extends Document {
  tag: ITag["_id"];
  participant: IParticipant["_id"];
  krok: IKrok["_id"];
  createdAt: Date;
  updatedAt: Date;
}

export const TagAssignmentSchema: Schema = new Schema(
  {
    tag: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    participant: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    krok: {
      type: Schema.Types.ObjectId,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<ITagAssignment>(
  "TagAssignment",
  TagAssignmentSchema
);
