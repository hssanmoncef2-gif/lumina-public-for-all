import mongoose, { Schema, Document, Model } from 'mongoose'

// ============================================================
// LUMINA — User Model
// ============================================================

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId
  email: string
  password: string          // bcrypt hashed
  displayName: string
  avatarUrl?: string
  streakDays: number
  lastActiveAt?: Date
  sessionVersion: number    // incremented on logout to invalidate all existing JWTs
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:     { type: String, required: true },
    displayName:  { type: String, default: '' },
    avatarUrl:       { type: String },
    streakDays:      { type: Number, default: 0 },
    lastActiveAt:    { type: Date },
    sessionVersion:  { type: Number, default: 0 },
  },
  { timestamps: true }
)

// Avoid model re-compilation in dev hot-reload
export const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>('User', UserSchema)
