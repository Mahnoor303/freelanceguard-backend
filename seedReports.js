const mongoose = require('mongoose');
const dotenv = require('dotenv');
const CommunityReport = require('./models/CommunityReport');
const User = require('./models/User');

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const user = await User.findOne(); // any user
  if (!user) { console.log('No users found'); process.exit(1); }

  const reports = [
    { userId: user._id, scammerName: 'FakeClient Ltd', platform: 'Upwork', description: 'Requests free work, then disappears', upvotes: 12, status: 'pending' },
    { userId: user._id, scammerName: 'BestDesigns', platform: 'Fiverr', description: 'Stole design concepts without payment', upvotes: 8, status: 'approved' },
    { userId: user._id, scammerName: 'QuickHire', platform: 'Freelancer', description: 'Phishing attempt for login credentials', upvotes: 5, status: 'rejected' },
  ];

  await CommunityReport.insertMany(reports);
  console.log('Fake reports inserted');
  process.exit(0);
});