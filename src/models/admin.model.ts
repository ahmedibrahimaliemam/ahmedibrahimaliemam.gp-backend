import mongoose, { Schema, Document } from "mongoose";

interface IAdmin extends Document {
  _id: string; // Phone number
  email: string;
  name: string;
  password: string;
}

const AdminSchema = new Schema<IAdmin>({
  _id: { type: String, required: true, unique: true }, // Ensuring phone number is unique
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    match: [/^\S+@\S+\.\S+$/, "Invalid email format"] // Basic email validation
  },
  name: { type: String, required: true },
  password: { type: String, required: true },
});

export default mongoose.model<IAdmin>("Admin", AdminSchema);
