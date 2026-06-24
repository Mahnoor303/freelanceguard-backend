const SubscriptionRequest = require('../models/SubscriptionRequest');
const User = require('../models/User');

// User sends upgrade request
exports.requestUpgrade = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.plan === 'pro') {
      return res.status(400).json({ message: 'You are already on Pro plan' });
    }

    // Check if a pending request already exists
    const existing = await SubscriptionRequest.findOne({ userId: user._id, status: 'pending' });
    if (existing) {
      return res.status(400).json({ message: 'You already have a pending upgrade request' });
    }

    const request = await SubscriptionRequest.create({
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      plan: 'pro'
    });

    res.status(201).json({ message: 'Upgrade request submitted. Waiting for admin approval.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get current user's request status (for frontend)
exports.getMyRequestStatus = async (req, res) => {
  try {
    const request = await SubscriptionRequest.findOne({ userId: req.user._id }).sort('-createdAt');
    res.json(request || { status: 'none' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Get all requests
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await SubscriptionRequest.find().sort('-createdAt');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Approve request
exports.approveRequest = async (req, res) => {
  try {
    const request = await SubscriptionRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    request.status = 'approved';
    await request.save();

    // Upgrade user plan
    await User.findByIdAndUpdate(request.userId, {
      plan: request.plan,
      subscriptionStatus: 'active',
      scanLimitPerDay: 999999
    });

    res.json({ message: 'Request approved, user upgraded' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Reject request
exports.rejectRequest = async (req, res) => {
  try {
    const request = await SubscriptionRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    request.status = 'rejected';
    request.adminNote = req.body.note || '';
    await request.save();

    res.json({ message: 'Request rejected' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.confirmPayment = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const plan = req.body.plan || 'pro';
    user.plan = plan;
    user.subscriptionStatus = 'active';
    user.scanLimitPerDay = 999999;
    user.subscriptionStartDate = new Date();                          // ✅ now
    user.subscriptionEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // ✅ 30 days
    await user.save();

    res.json({
      message: 'Upgraded successfully',
      plan: user.plan,
      subscriptionStartDate: user.subscriptionStartDate,
      subscriptionEndDate: user.subscriptionEndDate,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      'plan subscriptionStatus subscriptionStartDate subscriptionEndDate totalJobScans totalMessageScans totalContractScans totalClientChecks scanLimitPerDay'
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      'plan subscriptionStatus subscriptionStartDate subscriptionEndDate totalJobScans totalMessageScans totalContractScans totalClientChecks scanLimitPerDay'
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};