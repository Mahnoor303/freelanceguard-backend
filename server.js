const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');                       // 1. import http
const { Server } = require('socket.io');           // 2. import socket.io

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
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Security headers
app.use(helmet());

// General API rate limiter (100 requests per 15 minutes per IP)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many requests, please try again later.' }
});
app.use('/api', generalLimiter);

// Stricter rate limiter for auth routes (10 attempts per 15 minutes)
// const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 10,
//   message: { message: 'Too many login attempts, please try again later.' }
// });
// app.use('/api/auth', authLimiter);
// ---------- Create HTTP server & Socket.io ----------
const server = http.createServer(app);              // 3. create server after app
const io = new Server(server, {                     // 4. attach socket.io
  cors: { origin: '*' }
});

// Make io accessible to controllers
app.set('io', io);

// ---------- Middleware ----------
app.use(cors());
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
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error(err));

// ---------- Socket.io Events (optional) ----------
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
});