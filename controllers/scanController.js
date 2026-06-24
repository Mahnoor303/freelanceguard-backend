const { GoogleGenerativeAI } = require('@google/generative-ai');
const Scan = require('../models/Scan');
const User = require('../models/User');

// Initialize Gemini (may fail if quota exceeded, but we catch)
let genAI;
try {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
} catch (e) {
  console.warn('Gemini init failed, using dummy analysis');
}

// Common prompt builder
const buildPrompt = (text, scanType) => {
  const typeMap = {
    jobPost: 'a freelance job posting',
    message: 'a client message to a freelancer',
    contract: 'a freelance contract clause',
    client: 'a client/company lookup request (just name/email/domain)',
  };

  return `You are a scam detection expert for freelancers. Analyze the following ${typeMap[scanType]} and return ONLY a valid JSON object with exactly these fields:
- riskScore: number between 0-100 (higher = more risky)
- riskLevel: one of "safe", "caution", "danger"
- redFlags: array of short strings describing dangerous signs (empty if none)
- safeSigns: array of short strings describing trustworthy elements (empty if none)
- aiSummary: one-sentence summary of the analysis

Content to analyze:
"""
${text}
"""

Return ONLY the JSON object, no extra text.`;
};

// Dummy analysis (fallback when Gemini is unavailable)
const dummyAnalysis = (text, scanType) => {
  let riskScore, riskLevel, redFlags = [], safeSigns = [], aiSummary = '';

  if (scanType === 'jobPost') {
    riskScore = 75;
    riskLevel = 'danger';
    redFlags = ['Missing Company Details', 'Unrealistic Salary'];
    safeSigns = [];
    aiSummary = 'This job posting shows several scam indicators.';
  } else if (scanType === 'message') {
    riskScore = 65;
    riskLevel = 'caution';
    redFlags = ['Pressure Tactics', 'Urgency Language'];
    safeSigns = [];
    aiSummary = 'The message contains pressure tactics.';
  } else if (scanType === 'contract') {
    riskScore = 55;
    riskLevel = 'caution';
    redFlags = ['Unlimited Non-Compete', 'Late Payment Clause'];
    safeSigns = [];
    aiSummary = 'Contract has some risky clauses.';
  } else if (scanType === 'client') {
    riskScore = 20;
    riskLevel = 'safe';
    redFlags = [];
    safeSigns = ['Real company name', 'Domain verified'];
    aiSummary = 'Client appears trustworthy.';
  }

  return { riskScore, riskLevel, redFlags, safeSigns, aiSummary };
};

const analyzeWithGemini = async (text, scanType) => {
  // If Gemini is not initialized or we want to force dummy, use dummy
  if (!genAI) {
    console.log('Using dummy analysis (Gemini not available)');
    return dummyAnalysis(text, scanType);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const prompt = buildPrompt(text, scanType);
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleaned = responseText.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return {
      riskScore: Math.min(100, Math.max(0, parsed.riskScore || 50)),
      riskLevel: parsed.riskLevel || 'caution',
      redFlags: parsed.redFlags || [],
      safeSigns: parsed.safeSigns || [],
      aiSummary: parsed.aiSummary || 'No summary provided.',
    };
  } catch (error) {
    console.error('Gemini API error (using dummy):', error.message);
    return dummyAnalysis(text, scanType);
  }
};

const createScan = async (req, res) => {
  if (scanType === 'jobPost') await User.findByIdAndUpdate(userId, { $inc: { totalJobScans: 1 } });
  else if (scanType === 'message') await User.findByIdAndUpdate(userId, { $inc: { totalMessageScans: 1 } });
  else if (scanType === 'contract') await User.findByIdAndUpdate(userId, { $inc: { totalContractScans: 1 } });
  else if (scanType === 'client') await User.findByIdAndUpdate(userId, { $inc: { totalClientChecks: 1 } });
  const user = await User.findById(userId);
  if (user.plan === 'free') {
    // Daily limits
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const scansToday = await Scan.countDocuments({
      userId,
      createdAt: { $gte: today },
      scanType
    });
    if (scansToday >= user.scanLimitPerDay) {
      return res.status(403).json({ message: 'Daily scan limit reached. Upgrade to Pro for unlimited.' });
    }
  }
  try {
    const userId = req.user._id;
    const { inputText } = req.body;
    let scanType;

    if (req.originalUrl.includes('/job')) scanType = 'jobPost';
    else if (req.originalUrl.includes('/message')) scanType = 'message';
    else if (req.originalUrl.includes('/contract')) scanType = 'contract';
    else if (req.originalUrl.includes('/client')) scanType = 'client';
    else return res.status(400).json({ message: 'Invalid scan type' });

    if (!inputText || inputText.trim().length < 5) {
      return res.status(400).json({ message: 'Input text is too short' });
    }

    const analysis = await analyzeWithGemini(inputText, scanType);

    const scan = await Scan.create({
      userId,
      scanType,
      inputText,
      riskScore: analysis.riskScore,
      riskLevel: analysis.riskLevel,
      redFlags: analysis.redFlags,
      safeSigns: analysis.safeSigns,
      aiSummary: analysis.aiSummary,
    });
    io.emit('admin-new-scan', scan);
    await User.findByIdAndUpdate(userId, { $inc: { totalScans: 1 } });

    // Notification for admin
    try {
      const Notification = require('../models/Notification');
      await Notification.create({
        title: 'New Scan Performed',
        message: `${scan.scanType} scan by user. Risk: ${scan.riskLevel} (${scan.riskScore}%)`,
        type: scan.riskLevel === 'danger' ? 'alert' : scan.riskLevel === 'caution' ? 'warning' : 'info',
        isAdminNotif: true,
      });
    } catch (notifErr) {
      console.error('Notification error:', notifErr.message);
    }

    // Real-time event
    const io = req.app.get('io');
    if (io) io.emit('new-scan', scan);

    res.status(201).json(scan);
  } catch (error) {
    console.error('Scan error:', error);
    res.status(500).json({ message: error.message });
  }
};

const getHistory = async (req, res) => {
  try {
    const scans = await Scan.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(scans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteScan = async (req, res) => {
  try {
    const scan = await Scan.findById(req.params.id);
    if (!scan) return res.status(404).json({ message: 'Scan not found' });
    if (scan.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    await Scan.deleteOne({ _id: req.params.id });
    res.json({ message: 'Scan deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createScan, getHistory, deleteScan };