const { GoogleGenerativeAI } = require('@google/generative-ai');
const Scan = require('../models/Scan');
const User = require('../models/User');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

const analyzeWithGemini = async (text, scanType) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const prompt = buildPrompt(text, scanType);

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();

  // Clean the response (sometimes Gemini wraps in ```json)
  const cleaned = responseText.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(cleaned);

  return {
    riskScore: Math.min(100, Math.max(0, parsed.riskScore || 50)),
    riskLevel: parsed.riskLevel || 'caution',
    redFlags: parsed.redFlags || [],
    safeSigns: parsed.safeSigns || [],
    aiSummary: parsed.aiSummary || 'No summary provided.',
  };
};

const createScan = async (req, res) => {
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

    // Real AI analysis – no dummy fallback
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
    // Return the actual error so you can see what went wrong
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