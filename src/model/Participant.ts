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

const nameValidator = {
  validator(value: string) {
    if (/[\d`!@#$%^&*()_+=[\]{};:"|,<>/?~]/.test(value)) {
      return false;
    }

    return true;
  },
  message: () => "Name must not contain digits or special characters",
};

const ParticipantNameSchema: Schema = new Schema({
  first: {
    type: String,
    required: [true, "First name is required"],
    validate: nameValidator,
  },
  last: {
    type: String,
    required: [true, "Last name is required"],
    validate: nameValidator,
  },
  middle: {
    type: String,
    required: false,
    validate: nameValidator,
  },
});

export const ParticipantSchema: Schema = new Schema(
  {
    name: {
      type: ParticipantNameSchema,
      required: [true, "Participant name is required"],
    },
    birthday: {
      type: Date,
      required: [true, "Birthday is required"],
    },
    phone: {
      type: String,
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
      required: false,
      trim: true,
      lowercase: true,
      validate: [Validator.isEmail, "Invalid email"],
    },
  },
  { timestamps: true }
);

ParticipantSchema.index(
  { birthday: 1, "name.last": 1, "name.first": 1 },
  { unique: true }
);

export default mongoose.model<IParticipant>("Participant", ParticipantSchema);
