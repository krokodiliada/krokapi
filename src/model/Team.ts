import mongoose, { Schema, Document } from "mongoose";
import { IParticipant } from "model/Participant";
import { IEvent } from "model/Event";
import { ICategory } from "model/Category";
import { IRoute } from "model/Route";

export interface ITeam extends Document {
  name: string;
  participants: Array<IParticipant["_id"]>;
  event: IEvent["_id"];
  category: ICategory["_id"];
  extraMapRequired: boolean;
  amountPaid: number;
  routes: Array<IRoute["_id"]>;
  createdAt: Date;
  updatedAt: Date;
}

export const TeamSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Team name is required"],
    },
    participants: {
      type: [Schema.Types.ObjectId],
      ref: "Participant",
      required: [true, "List of participant identifiers is required"],
      validate: {
        validator: (participants: Array<Schema.Types.ObjectId>) => {
          return participants !== undefined && participants.length !== 0;
        },
        message: () => `Participants array cannot be empty`,
      },
    },
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event id is required"],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category id is required"],
    },
    extraMapRequired: {
      type: Boolean,
      required: false,
      default: false,
    },
    amountPaid: {
      type: Number,
      required: false,
      default: 0,
      validate: {
        validator: (value: number) => {
          return value >= 0;
        },
        message: (props) => `${props.value} must not be negative`,
      },
    },
  },
  { timestamps: true }
);

TeamSchema.index({ name: 1, event: 1 }, { unique: true });

export default mongoose.model<ITeam>("Team", TeamSchema);
