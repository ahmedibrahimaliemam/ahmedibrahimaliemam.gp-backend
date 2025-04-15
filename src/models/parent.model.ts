import mongoose, { Schema, Document } from "mongoose";

export interface IParent extends Document {
  _id: string;          // e.g., parent's phone number or other unique identifier
  name: string;
  phoneNumber:string;
  email: string;
  password: string;
  players: string[];    // Array of Player IDs (as strings)
  // You can add other fields as needed (e.g., notifications, address, etc.)
}

const ParentSchema = new Schema<IParent>(
  {
    _id: { type: String },
    phoneNumber:{type:String , required:true },        // Unique identifier (phone number, etc.)
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    players: [{ type: String, ref: "Player" }],     // Relationship: each parent's children (players)
  },
  { timestamps: true }  // Automatically adds createdAt and updatedAt fields
);

export default mongoose.model<IParent>("Parent", ParentSchema);
