import mongoose, { Schema, Document } from "mongoose";

interface IAdmin extends Document {
  _id: string; // Phone number
  name: string;
  password: string;
}

const AdminSchema = new Schema<IAdmin>({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
});

export default mongoose.model<IAdmin>("Admin", AdminSchema);
