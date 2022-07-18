const crypto = require('crypto');
const mongoose = require('mongoose');
const { isEmail } = require('validator');
const slugify = require('slugify');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [ true, 'Please provide a username' ],
    unique: true,
    maxLength: [ 25, 'Maximum username length is 25 characters' ]
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
    required: [ true, 'Please provide a password' ],
    minLength: [ 6, 'Minimum password length is 6 characters' ],
    select: false
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
  if (!this.isModified('password')) return next()
  const saltRounds = 10;
  this.password = await bcrypt.hash(this.password, saltRounds);
  this.slug = slugify(this.username, { lower: true });
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

exports.User = mongoose.model('User', userSchema);