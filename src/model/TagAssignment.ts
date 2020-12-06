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
      ref: "Tag",
      required: true,
    },
    participant: {
      type: Schema.Types.ObjectId,
      ref: "Participant",
      required: true,
    },
    krok: {
      type: Schema.Types.ObjectId,
      ref: "Krok",
      required: true,
    },
  },
  { timestamps: true }
);

// Single tag cannot be assigned to multiple people
TagAssignmentSchema.index({ tag: 1, krok: 1 }, { unique: true });

// Multiple tags cannot be assigned to one participant
TagAssignmentSchema.index({ participant: 1, krok: 1 }, { unique: true });

export default mongoose.model<ITagAssignment>(
  "TagAssignment",
  TagAssignmentSchema
);
