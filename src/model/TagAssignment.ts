import mongoose, { Schema, Document } from "mongoose";
import { IParticipant } from "model/Participant";
import { IEvent } from "model/Event";

export interface ITagAssignment extends Document {
  tag: number;
  participant: IParticipant["_id"];
  event: IEvent["_id"];
  createdAt: Date;
  updatedAt: Date;
}

export const TagAssignmentSchema: Schema = new Schema(
  {
    tag: {
      type: Number,
      required: true,
    },
    participant: {
      type: Schema.Types.ObjectId,
      ref: "Participant",
      required: true,
    },
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
  },
  { timestamps: true }
);

// Single tag cannot be assigned to multiple people
TagAssignmentSchema.index({ tag: 1, event: 1 }, { unique: true });

// Multiple tags cannot be assigned to one participant
TagAssignmentSchema.index({ participant: 1, event: 1 }, { unique: true });

export default mongoose.model<ITagAssignment>(
  "TagAssignment",
  TagAssignmentSchema
);
