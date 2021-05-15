import mongoose, { Schema, Document } from "mongoose";

export interface ICategoryName extends Document {
  short: string;
  long: string;
}

export interface ICategoryParticipantsNumber extends Document {
  min: number;
  max: number;
}

export interface ICategoryActiveTime extends Document {
  open: Date;
  close: Date;
}

export interface ICategory extends Document {
  name: ICategoryName;
  description: string;
  participantsNumber: ICategoryParticipantsNumber;
  /**
   * @brief Minimum number of checkpoints required to take.
   * @details Can be either float, e.g. 0.3, or an integer, e.g. 5.
   * In case of a float value, the minimum number of checkpoints is calculated
   * as a total number of checkpoints in this category multiplied by
   * @p minCheckpoints.
   */
  minCheckpoints: number;
  /**
   * @brief Maximum number of hours allowed to finish the race in this category.
   * @details For example, when @p maxTime is set to 10, then all teams
   * participating in this category will have 10 hours to finish the race.
   * Teams that exceeded @p maxTime will be disqualified.
   */
  maxTime: number;
  price: number;
  activeTime: ICategoryActiveTime;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CategoryNameSchema: Schema = new Schema({
  short: {
    type: String,
    required: [true, "Short name is required"],
  },
  long: {
    type: String,
    required: [true, "Long name is required"],
  },
});

const ParticipantsNumberSchema: Schema = new Schema({
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
});

const CategoryActiveTimeSchema: Schema = new Schema({
  open: {
    type: Date,
    required: false,
  },
  close: {
    type: Date,
    required: false,
    validate: {
      validator(this: ICategoryActiveTime, value: Date) {
        return value >= this.open;
      },
      message: () => "Category close time must be later or equal to open time",
    },
  },
});

export const CategorySchema: Schema = new Schema(
  {
    name: {
      type: CategoryNameSchema,
      required: [true, "Category name is required"],
      unique: true,
    },
    description: {
      type: String,
      required: false,
    },
    participantsNumber: {
      type: ParticipantsNumberSchema,
      required: false,
      default: {
        min: 1,
        max: 5,
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
    price: {
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
    activeTime: {
      type: CategoryActiveTimeSchema,
      required: false,
    },
    notes: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

CategoryNameSchema.index({ short: 1, long: 1 }, { unique: true });

export default mongoose.model<ICategory>("Category", CategorySchema);
