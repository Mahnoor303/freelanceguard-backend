const mongoose = require('mongoose');

const siteContentSchema = new mongoose.Schema(
  {
    heroTitle: { type: String, default: 'Protect Your Work. Guard Your Income.' },
    heroSubtitle: { type: String, default: 'AI-powered scam detection built specifically for freelancers.' },
    pricing: [{
      plan: String,
      price: String,
      period: String,
      features: [String],
      popular: Boolean,
      cta: String
    }],
    faqs: [{
      question: String,
      answer: String
    }],
    testimonials: [{
      name: String,
      role: String,
      quote: String
    }]
  },
  { timestamps: true }
);

module.exports = mongoose.model('SiteContent', siteContentSchema);