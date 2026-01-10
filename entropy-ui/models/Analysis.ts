import mongoose, { Schema, model, models } from 'mongoose';

const AnalysisSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  projectName: { type: String, default: 'Unknown Project' },
  scanDate: { type: Date, default: Date.now },
  entropyScore: { type: Number, default: 0 }, // 0-100
  
  // This matches the JSON output from your Python Script
  cards: [{
    name: String,
    type: String,
    severity: String,
    thought_signature: String,
    trigger_endpoint: String,
    diagram_code: String,
    fix_explanation: String
  }]
});

const Analysis = models.Analysis || model('Analysis', AnalysisSchema);

export default Analysis;