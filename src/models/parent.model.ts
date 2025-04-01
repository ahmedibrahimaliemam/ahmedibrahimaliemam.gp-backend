import mongoose, { Schema, Document } from "mongoose";

export interface IParent extends Document {
  _id:string;  
  name: string;
  email: string;
  password: string;
  // Optional: List of children (player references)
  children?: mongoose.Types.ObjectId[];
}

const parentSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  children: [{ type: mongoose.Schema.Types.ObjectId, ref: "Player" }],
});

const Parent = mongoose.model<IParent>("Parent", parentSchema);

export default Parent;
