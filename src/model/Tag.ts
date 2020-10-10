import mongoose, { Schema, Document } from "mongoose";

export interface ITag extends Document {
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const TagSchema: Schema = new Schema(
  {
    enabled: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<ITag>("Tag", TagSchema);
