import mongoose, { Schema, model, models } from 'mongoose';

const AnalysisSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true, 
  },
  projectName: { type: String, default: 'Unknown Project' },
  scanDate: { type: Date, default: Date.now },
  entropyScore: { type: Number, default: 0 }, 

  // THE FIX: Schema.Types.Mixed tells MongoDB "Accept anything here"
  // This solves the casting error instantly.
  cards: { type: Schema.Types.Mixed, default: [] }
});

// We use 'AnalysisFinal' to ensure a brand new collection is created
const Analysis = models.AnalysisFinal || model('AnalysisFinal', AnalysisSchema);

export default Analysis;