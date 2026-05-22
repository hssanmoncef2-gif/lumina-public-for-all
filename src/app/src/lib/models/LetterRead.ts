import mongoose, { Schema, Document, Model } from 'mongoose'

// ============================================================
// LUMINA — LetterRead Model
// ============================================================

export interface ILetterRead extends Document {
  userId: mongoose.Types.ObjectId
  letterId: string
  readAt: Date
}

const LetterReadSchema = new Schema<ILetterRead>({
  userId:   { type: Schema.Types.Mixed, required: true },
  letterId: { type: String, required: true },
  readAt:   { type: Date, default: Date.now },
})

LetterReadSchema.index({ userId: 1, letterId: 1 }, { unique: true })

export const LetterRead: Model<ILetterRead> =
  mongoose.models.LetterRead ??
  mongoose.model<ILetterRead>('LetterRead', LetterReadSchema)
