const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const User = require('../models/User');
const Scan = require('../models/Scan');
const CommunityReport = require('../models/CommunityReport');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// ---------- Auth ----------
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (admin && (await admin.matchPassword(password))) {
      res.json({
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        token: generateToken(admin._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await Admin.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Admin already exists' });
    const admin = await Admin.create({ name, email, password, role });
    res.status(201).json({ _id: admin._id, name: admin.name, email: admin.email, role: admin.role });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id).select('-password');
    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------- Dashboard ----------
const dashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalScans = await Scan.countDocuments();
    const dangerScans = await Scan.countDocuments({ riskLevel: 'danger' });
    const communityReports = await CommunityReport.countDocuments();
    res.json({ totalUsers, totalScans, dangerScans, communityReports });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------- Profile & Admin management ----------
const updateProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    admin.name = req.body.name || admin.name;
    admin.email = req.body.email || admin.email;
    if (req.body.password) {
      admin.password = req.body.password; // hashed automatically via pre‑save hook
    }
    await admin.save();
    res.json({ _id: admin._id, name: admin.name, email: admin.email, role: admin.role });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select('-password');
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteAdmin = async (req, res) => {
  try {
    // Only superadmin can delete
    if (req.admin.role !== 'superadmin') {
      return res.status(403).json({ message: 'Only superadmin can delete admins' });
    }
    const admin = await Admin.findByIdAndDelete(req.params.id);
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    res.json({ message: 'Admin deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get chart data for admin dashboard
// @route   GET /api/admin/charts
const charts = async (req, res) => {
  try {
    // User growth (last 6 months)
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthName = d.toLocaleString('default', { month: 'short' });
      const year = d.getFullYear();
      const start = new Date(year, d.getMonth(), 1);
      const end = new Date(year, d.getMonth() + 1, 0);
      const count = await User.countDocuments({ createdAt: { $gte: start, $lte: end } });
      months.push({ month: monthName, users: count });
    }

    // Scan activity (last 7 days)
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const end = new Date(start.getTime() + 86400000);
      const count = await Scan.countDocuments({ createdAt: { $gte: start, $lt: end } });
      days.push({ day: dayName, scans: count });
    }

    // Scam categories (based on scan risk levels)
    const safe = await Scan.countDocuments({ riskLevel: 'safe' });
    const caution = await Scan.countDocuments({ riskLevel: 'caution' });
    const danger = await Scan.countDocuments({ riskLevel: 'danger' });
    const scamCategories = [
      { name: 'Safe', value: safe, color: '#10B981' },
      { name: 'Caution', value: caution, color: '#F59E0B' },
      { name: 'Danger', value: danger, color: '#EF4444' },
    ];

    res.json({ months, days, scamCategories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { login, register, getMe, dashboard, updateProfile, getAdmins, deleteAdmin, charts };