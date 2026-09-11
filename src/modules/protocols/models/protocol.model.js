import mongoose from 'mongoose';

const protocolSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  slug: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true,
    trim: true,
    index: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  logo: {
    type: String,
    required: false 
  },
  highlights: [{
    title: { type: String, required: true }, 
    content: { type: String, required: true }
  }],
  routine: {
    morning: [{ step: String, productType: String, note: String }],
    evening: [{ step: String, productType: String, note: String }]
  },
  
  duration: String,
  targetTypes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TargetType',
    required: true
  }],
  targetConcerns: [String],
  isFeatured: { 
    type: Boolean, 
    default: false 
  }
}, { 
  timestamps: true 
});

const Protocol = mongoose.model('Protocol', protocolSchema);

export default Protocol;