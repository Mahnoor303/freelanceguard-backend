const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    avatar: {
      type: String,
      default: '',
    },
    freelanceNiche: {
      type: String,
      default: '',
    },
    totalScans: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'suspended'],
      default: 'active',
    },
    isVerified: { type: Boolean, default: false },
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    plan: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
    stripeCustomerId: String,
    subscriptionId: String,
    subscriptionStatus: { type: String, enum: ['active', 'inactive'], default: 'inactive' },
    plan: { type: String, enum: ['free', 'pro', 'elite'], default: 'free' },
    subscriptionStatus: { type: String, enum: ['active', 'inactive'], default: 'inactive' },
    paymentMethod: String,
    subscriptionStartDate: Date,
    subscriptionEndDate: Date,
    totalJobScans: { type: Number, default: 0 },
    totalMessageScans: { type: Number, default: 0 },
    totalContractScans: { type: Number, default: 0 },
    totalClientChecks: { type: Number, default: 0 },
    scanLimitPerDay: { type: Number, default: 5 },
    subscriptionExpiry: Date,   // when the current plan expires
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);