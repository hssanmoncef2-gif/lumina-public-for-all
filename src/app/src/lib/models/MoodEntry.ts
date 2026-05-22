import mongoose, { Schema, Document, Model } from 'mongoose'

// ============================================================
// LUMINA — MoodEntry Model
// ============================================================

export interface IMoodEntry extends Document {
  _id: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  moodId: string
  intensity: number
  notes?: string
  createdAt: Date
}

const MoodEntrySchema = new Schema<IMoodEntry>(
  {
    userId:    { type: Schema.Types.Mixed, required: true, index: true },
    moodId:    { type: String, required: true },
    intensity: { type: Number, default: 3, min: 1, max: 5 },
    notes:     { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

export const MoodEntry: Model<IMoodEntry> =
  mongoose.models.MoodEntry ??
  mongoose.model<IMoodEntry>('MoodEntry', MoodEntrySchema)
