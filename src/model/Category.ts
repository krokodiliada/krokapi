import mongoose, { Schema, Document } from "mongoose";
import { IKrok } from "./Krok";

export interface ICategoryName extends Document {
  short: string;
  long: string;
}

export interface ICategoryParticipantsNumber extends Document {
  min: number;
  max: number;
}

export interface ICategory extends Document {
  name: ICategoryName;
  description: string;
  krok: IKrok["_id"];
  participantsNumber: ICategoryParticipantsNumber;
  /**
   * @brief Minimum number of checkpoints required to take.
   * @details Can be either float, e.g. 0.3, or an integer, e.g. 5.
   * In case of a float value, the minimum number of checkpoints is calculated
   * as a total number of checkpoints in this category multiplied by
   * @p minCheckpoints.
   */
  minCheckpoints: any;
  /**
   * @brief Maximum number of hours allowed to finish the race in this category.
   * @details For example, when @p maxTime is set to 10, then all teams
   * participating in this category will have 10 hours to finish the race.
   * Teams that exceeded @p maxTime will be disqualified.
   */
  maxTime: number;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export const CategorySchema: Schema = new Schema(
  {
    name: {
      short: {
        type: String,
        required: true,
      },
      long: {
        type: String,
        required: true,
      },
    },
    description: {
      type: String,
      required: false,
    },
    krok: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    participantsNumber: {
      min: {
        type: Number,
        required: false,
        default: 1,
      },
      max: {
        type: Number,
        required: false,
        default: 5,
      },
    },
    minCheckpoints: {
      type: Number,
      required: false,
      default: 0,
    },
    maxTime: {
      type: Number,
      required: false,
      default: 10,
    },
    notes: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model<ICategory>("Category", CategorySchema);
