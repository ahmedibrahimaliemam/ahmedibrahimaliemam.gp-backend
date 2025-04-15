import mongoose, { Schema, Document } from "mongoose";

export interface IPlayer extends Document {
  _id: string;
  overall:number; 
  height_cm:number;
  weight_kg:number;
  club_position:string;
  attacking_crossing:number;
  club_name:string;              // Phone number as ID
  short_name: string;
  //position: string;
  coachId: string;
  Team_name: string;
  //password: string;
  preferred_foot?: string;   // e.g., "left" or "right"
  weak_foot?: number;        // e.g., rating from 1 to 5
  pace?: number;             // e.g., rating from 1 to 100
  shooting?: number;         // e.g., rating from 1 to 100
  passing?: number;          // e.g., rating from 1 to 100
  dribbling?: number;        // e.g., rating from 1 to 100
  defending?: number;        // e.g., rating from 1 to 100
  physic?: number;           // e.g., rating from 1 to 100
  player_face_url?: string;  // URL string for the player's image
  goalkeeping_diving?: number;
  goalkeeping_handling?: number;
  goalkeeping_kicking?: number;
  goalkeeping_positioning?: number;
  goalkeeping_reflexes?: number;
  goalkeeping_speed?: number;
}

const PlayerSchema = new Schema<IPlayer>(
  {
    _id: { type: String, required: true },  // Using phone number as the _id
    short_name: { type: String, required: true },
    //position: { type: String, required: true },
    coachId: { type: String, ref: "Coach", required: true },
    Team_name: { type: String, ref: "Team", required: true },
    //password: { type: String, required: true },
    preferred_foot: { type: String },
    club_position:{type:String},
    weak_foot: { type: Number },
    weight_kg:{type:Number},
    pace: { type: Number },
    shooting: { type: Number },
    passing: { type: Number },
    dribbling: { type: Number },
    height_cm:{type:Number},
    defending: { type: Number },
    overall:{type:Number},
    physic: { type: Number },
    player_face_url: { type: String },
    goalkeeping_diving: { type: Number },
    goalkeeping_handling: { type: Number },
    goalkeeping_kicking: { type: Number },
    goalkeeping_positioning: { type: Number },
    goalkeeping_reflexes: { type: Number },
    goalkeeping_speed: { type: Number },
  },
  { timestamps: true }
);

export default mongoose.model<IPlayer>("Player", PlayerSchema);
