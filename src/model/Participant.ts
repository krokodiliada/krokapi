import mongoose, { Schema, Document } from "mongoose";
import Validator from "validator";

export interface IParticipantName extends Document {
  first: string;
  last: string;
  middle: string;
}

export interface IParticipant extends Document {
  name: IParticipantName;
  birthday: Date;
  phone: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const ParticipantNameSchema: Schema = new Schema({
  first: {
    type: String,
    required: true,
  },
  last: {
    type: String,
    required: true,
  },
  middle: {
    type: String,
    required: false,
  },
});

export const ParticipantSchema: Schema = new Schema(
  {
    name: {
      type: ParticipantNameSchema,
      required: true,
    },
    birthday: {
      type: Date,
      required: true,
    },
    phone: {
      type: String,
      unique: true,
      required: false,
      validate: {
        validator: (value: string) => {
          return Validator.isMobilePhone(value, "ru-RU", { strictMode: true });
        },
        message: (props) => `${props.value} is not a valid phone number`,
      },
    },
    email: {
      type: String,
      unique: true,
      required: false,
      trim: true,
      lowercase: true,
      validate: [Validator.isEmail, "Invalid email"],
    },
  },
  { timestamps: true }
);

ParticipantSchema.index({ birthday: 1, name: { last: 1, first: 1 } }, { unique: true });

export default mongoose.model<IParticipant>("Participant", ParticipantSchema);
