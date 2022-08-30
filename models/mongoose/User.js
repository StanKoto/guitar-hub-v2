import * as crypto from 'crypto';
import mongoose from 'mongoose';
import isEmail from 'validator/lib/isEmail.js';
import slugify from 'slugify';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [ true, 'Please provide a username' ],
    unique: true,
    maxLength: [ 30, 'Maximum username length is 30 characters' ]
  },
  slug: String,
  email: {
    type: String,
    required: [ true, 'Please provide an email' ],
    unique: true,
    lowercase: true,
    validate: [ isEmail, 'Please enter a valid email' ]
  },
  password: {
    type: String,
    required: [ function () { return this.passwordSet === true }, 'Please provide a password' ],
    minLength: [ 6, 'Minimum password length is 6 characters' ],
    select: false
  },
  passwordSet: {
    type: Boolean,
    default: true
  },
  tipCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: [ 'active', 'passive' ],
    default: 'passive'
  },
  role: {
    type: String,
    enum: [ 'admin', 'user' ],
    default: 'user'
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: true
});

userSchema.index({ username: 'text', email: 'text' });

userSchema.pre('save', async function (next) {
  if (this.isModified('username')) this.slug = slugify(this.username, { lower: true })
  if (this.password) {
    if (!this.isModified('password')) return next()
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
});

userSchema.pre('remove', async function () {
  await this.model('Tip').updateMany({ author: this._id }, { author: null });
  await this.model('Rating').updateMany({ reviewer: this._id }, { reviewer: null });
  await this.model('Rating').updateMany({ recipient: this._id }, { recipient: null });
});

userSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex');

  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

export const User = mongoose.model('User', userSchema);