const { GoogleGenerativeAI } = require('@google/generative-ai');
const Scan = require('../models/Scan');
const User = require('../models/User');

let genAI;
try {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
} catch (e) {
  console.warn('Gemini init failed, using dummy analysis');
}

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

// Enhanced dummy analysis – realistic, keyword-based, returns different scores
const dummyAnalysis = (text, scanType) => {
  const lower = text.toLowerCase();
  let riskScore = 50;
  let redFlags = [];
  let safeSigns = [];
  let aiSummary = '';

  if (scanType === 'jobPost') {
    if (lower.includes('urgent') || lower.includes('immediately')) { riskScore += 15; redFlags.push('Urgency Language'); }
    if (lower.includes('salary') && (lower.includes('high') || lower.includes('$'))) { riskScore += 10; redFlags.push('Unrealistic Salary'); }
    if (lower.includes('no experience') || lower.includes('no skill')) { riskScore += 10; redFlags.push('No Experience Required'); }
    if (!lower.includes('company') && !lower.includes('team')) { riskScore += 5; redFlags.push('Missing Company Details'); }
    if (lower.includes('personal') || lower.includes('id') || lower.includes('passport')) { riskScore += 15; redFlags.push('Requests Personal Info'); }
    if (lower.includes('reputable') || lower.includes('well-known')) { safeSigns.push('Mentions reputable company'); riskScore -= 10; }
    aiSummary = riskScore > 70 ? 'This job posting shows several scam indicators.' : riskScore > 40 ? 'Some suspicious elements.' : 'Job posting seems normal.';
  } 
  else if (scanType === 'message') {
    if (lower.includes('urgent') || lower.includes('asap')) { riskScore += 15; redFlags.push('Urgency Tactics'); }
    if (lower.includes('pay') && (lower.includes('later') || lower.includes('after'))) { riskScore += 10; redFlags.push('Pay Later Promise'); }
    if (lower.includes('whatsapp') || lower.includes('telegram') || lower.includes('off-platform')) { riskScore += 20; redFlags.push('Off-platform Communication'); }
    if (lower.includes('dear') || lower.includes('kindly') || lower.includes('sir')) { riskScore += 5; redFlags.push('Generic Greeting'); }
    if (lower.includes('linkedin') || lower.includes('portfolio')) { safeSigns.push('Professional reference'); riskScore -= 10; }
    aiSummary = riskScore > 70 ? 'Message contains strong scam signals.' : riskScore > 40 ? 'Some suspicious patterns.' : 'Message appears genuine.';
  }
  else if (scanType === 'contract') {
    if (lower.includes('non-compete') && (lower.includes('years') || lower.includes('worldwide'))) { riskScore += 20; redFlags.push('Excessive Non-Compete'); }
    if (lower.includes('payment') && (lower.includes('days') || lower.includes('net'))) { riskScore += 10; redFlags.push('Delayed Payment Terms'); }
    if (lower.includes('intellectual property') && lower.includes('transfer')) { riskScore += 15; redFlags.push('IP Transfer Clause'); }
    if (lower.includes('clear') || lower.includes('standard')) { safeSigns.push('Standard clauses'); riskScore -= 10; }
    aiSummary = riskScore > 60 ? 'Contract has risky clauses.' : 'Contract appears balanced.';
  }
  else if (scanType === 'client') {
    if (lower.includes('google') || lower.includes('microsoft') || lower.includes('apple')) { riskScore = 10; safeSigns.push('Well-known company'); }
    else if (lower.includes('new') || lower.includes('no website')) { riskScore = 70; redFlags.push('New/Unknown Company'); }
    else if (lower.includes('linkedin') || lower.includes('domain')) { riskScore = 30; safeSigns.push('Online presence found'); }
    else { riskScore = 40; }
    aiSummary = riskScore < 30 ? 'Client appears trustworthy.' : riskScore > 60 ? 'Client has high risk.' : 'Client requires further verification.';
  }

  riskScore = Math.min(100, Math.max(5, riskScore));
  const riskLevel = riskScore > 70 ? 'danger' : riskScore > 40 ? 'caution' : 'safe';
  return { riskScore, riskLevel, redFlags, safeSigns, aiSummary };
};

const analyzeWithGemini = async (text, scanType) => {
  if (!genAI) {
    console.log('Using dummy analysis (Gemini not available)');
    return dummyAnalysis(text, scanType);
  }

  try {
    // 👇 CORRECTED MODEL NAME – now valid
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
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
    console.error('Gemini API error (using enhanced dummy):', error.message);
    return dummyAnalysis(text, scanType);   // now this will give varied results
  }
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