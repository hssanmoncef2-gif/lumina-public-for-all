import mongoose, { Schema, Document, Model } from 'mongoose'

// ============================================================
// LUMINA — JournalEntry Model
// ============================================================

export interface IJournalEntry extends Document {
  _id: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  title?: string
  content: string
  mood?: string
  moodIntensity?: number
  tags: string[]
  isFavorite: boolean
  aiSummary?: string
  createdAt: Date
  updatedAt: Date
}

const JournalEntrySchema = new Schema<IJournalEntry>(
  {
    userId:       { type: Schema.Types.Mixed, required: true, index: true },
    title:        { type: String },
    content:      { type: String, required: true },
    mood:         { type: String },
    moodIntensity:{ type: Number },
    tags:         { type: [String], default: [] },
    isFavorite:   { type: Boolean, default: false },
    aiSummary:    { type: String },
  },
  { timestamps: true }
)

export const JournalEntry: Model<IJournalEntry> =
  mongoose.models.JournalEntry ??
  mongoose.model<IJournalEntry>('JournalEntry', JournalEntrySchema)
