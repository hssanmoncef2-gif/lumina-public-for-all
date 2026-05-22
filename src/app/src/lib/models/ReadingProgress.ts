import mongoose, { Schema, model, models } from 'mongoose'

const ReadingProgressSchema = new Schema({
  userId:     { type: Schema.Types.Mixed, required: true, index: true },
  bookId:     { type: String, required: true },
  source:     { type: String, enum: ['supabase', 'openlibrary', 'gutenberg'], required: true },
  pageNumber: { type: Number, default: 1 },
  totalPages: { type: Number, default: 0 },
  title:      { type: String },
  coverUrl:   { type: String },
  updatedAt:  { type: Date, default: Date.now },
}, { timestamps: true })

ReadingProgressSchema.index({ userId: 1, bookId: 1 }, { unique: true })

export const ReadingProgress =
  models.ReadingProgress || model('ReadingProgress', ReadingProgressSchema)
