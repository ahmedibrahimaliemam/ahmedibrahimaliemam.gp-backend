import mongoose, { Schema, Document } from "mongoose";

interface ICoach extends Document {
  _id: string; // Phone number
  name: string;
  email:string ;
  teamId: string;
  phoneNumber: string;
  password: string;
}

const CoachSchema = new Schema<ICoach>({
 _id: { type: String , required:true }, // Phone number as _id
  name: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    match: [/^\S+@\S+\.\S+$/, "Invalid email format"] // Basic email validation
  },
  teamId: { type: String, ref: "Team", required: true }, // ✅ Use String instead of ObjectId
  phoneNumber: { type: String, required: true },
  password: { type: String, required: true },
});

export default mongoose.model<ICoach>("Coach", CoachSchema);
