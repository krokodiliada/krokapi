import mongoose, { Schema, Document } from "mongoose";
import Validator from "validator";

export interface Name extends Document {
  first: string;
  last: string;
  middle: string;
}

export interface IParticipant extends Document {
  name: Name;
  birthday: Date;
  phone: string;
  email: string;
  createdAt: Date;
  modifiedAt: Date;
}

export const ParticipantSchema: Schema = new Schema({
  name: {
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

  createdAt: {
    type: Date,
    required: false,
  },

  modifiedAt: {
    type: Date,
    required: false,
  },
});

// .pre("save", function (next) {
//   if (this.isNew) {
//     this.createdAt = new Date();
//   } else {
//     this.modifiedAt = new Date();
//   }
//   next();
// });

ParticipantSchema.index(
  { birthday: 1, name: { last: 1, first: 1 } },
  { unique: true }
);

export default mongoose.model<IParticipant>("Participant", ParticipantSchema);
