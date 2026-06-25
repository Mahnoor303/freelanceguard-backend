const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

// ---------- Import routes ----------
const authRoutes = require('./routes/authRoutes');
const scanRoutes = require('./routes/scanRoutes');
const reportRoutes = require('./routes/reportRoutes');
const communityRoutes = require('./routes/communityRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userManagementRoutes = require('./routes/userRoutes');
const scanManagementRoutes = require('./routes/scanManagementRoutes');
const reportManagementRoutes = require('./routes/reportManagementRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const contentPublicRoutes = require('./routes/contentRoutes');
const contentAdminRoutes = require('./routes/contentAdminRoutes');
const userNotificationRoutes = require('./routes/userNotificationRoutes');

// ---------- Init Express ----------
const app = express();

// 🔧 CORS – must be set BEFORE any other middleware or routes
app.use(cors({
  origin: ['https://mahnoor303.github.io', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Optionally keep helmet but disable the offending policy
const helmet = require('helmet');
app.use(helmet({ crossOriginResourcePolicy: false }));

// Rate limiter (commented out for now to avoid accidental blocks)
// const rateLimit = require('express-rate-limit');
// const generalLimiter = rateLimit({ ... });
// app.use('/api', generalLimiter);

// ---------- Create HTTP server & Socket.io ----------
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

app.set('io', io);

// ---------- Middleware ----------
app.use(express.json());

// ---------- Routes ----------
app.use('/api/auth', authRoutes);
app.use('/api/scan', scanRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/content', contentPublicRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/users', userManagementRoutes);
app.use('/api/admin/scans', scanManagementRoutes);
app.use('/api/admin/reports', reportManagementRoutes);
app.use('/api/admin/notifications', notificationRoutes);
app.use('/api/admin/content', contentAdminRoutes);
app.use('/api/notifications', userNotificationRoutes);
app.use('/api/subscription', require('./routes/subscriptionRoutes'));
app.use('/uploads', express.static('uploads'));
app.use('/api/testimonials', require('./routes/testimonialRoutes'));
app.use('/api/admin/subscription', require('./routes/adminSubscriptionRoutes'));
app.use('/api/admin/testimonials', require('./routes/adminTestimonialRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));

app.get('/', (req, res) => {
  res.json({ message: 'FreelanceGuard API running' });
});

// ---------- Connect DB & Start Server ----------
const PORT = process.env.PORT || 5000;
const IP = process.env.IP || '0.0.0.0';

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    server.listen(PORT, IP, () => {
      console.log(`Server running on ${IP}:${PORT}`);
    });
  })
  .catch((err) => console.error(err));

// ---------- Socket.io Events ----------
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
});