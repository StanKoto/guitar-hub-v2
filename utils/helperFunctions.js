const sharp = require('sharp');
const { User } = require('../models/User');
const { ErrorResponse } = require('../utils/errorHandling');

exports.asyncHandler = fn => (req, res, next) =>
Promise
  .resolve(fn(req, res, next))
  .catch(next);

exports.regenerateSession = (req, res, user, status = 200) => {
  req.session.regenerate(err => {
    if (err) throw err
    req.session.user = user._id;
    req.session.save(err => {
      if (err) throw err
      if (req.params.id && !req.body.newPassword) return res.status(status).json({ user, selfUpdate: true });
      res.status(status).json({ success: true });
    });
  });
};

exports.clearSessionUser = (req, res, selfDelete) => {
  req.session.user = null;
  req.session.save(err => {
    if (err) throw err
    req.session.regenerate(err => {
      if (err) throw err
      if (selfDelete) return res.status(200).json({ selfDelete })
      res.status(200).redirect('/auth');
    });
  });
};

exports.checkPassword = async (req, user, password) => {
  let errorMessage = 'Invalid credentials';
  if (req.user) errorMessage = 'Invalid password'
  const isMatch = await user.matchPassword(password);
  if (!isMatch) throw new Error(errorMessage)
};

exports.checkAuthorship = (req, tip) => {
  if ((!tip.author || tip.author && !tip.author.equals(req.user._id)) && req.user.role === 'user') {
    throw new ErrorResponse('You are not authorized to alter or delete this tip!', 401);
  }
};

exports.checkUserStatus = async (req) => {
  if (req.user.status === 'passive') {
    const updatedUser = await User.findByIdAndUpdate(req.user._id, { status: 'active' }, {
      runValidators: true,
      new: true
    });
    if (!updatedUser) throw new ErrorResponse(`No user found with ID of ${req.user._id}`, 404)
  }
};

exports.checkResource = async (req, model, select, populate) => {
  const id = req.params.id || req.user._id;
  let resource = model.findById(id)
  if (select) resource = await resource.select(select)
  if (populate) resource = await resource.populate(populate)
  if (!resource) throw new ErrorResponse(`No ${model.collection.collectionName.toLowerCase()} found with ID of ${id}`, 404)
  return resource;
};

exports.checkResourceAndUpdate = async (req, model) => {
  const id = req.params.id || req.user._id;
  const resource = await model.findByIdAndUpdate(id, req.body, {
    runValidators: true,
    new: true
  });
  if (!resource) throw new ErrorResponse(`No ${model.collection.collectionName.toLowerCase()} found with ID of ${id}`, 404)
  return resource;
};

exports.processImages = async (req, images) => {
  const bufferArray = await Promise.all(req.files.map(file => sharp(file.buffer).resize(480, 270).png().toBuffer()));
  for (const buffer of bufferArray) {
    for(const image of images) {
      if (Buffer.compare(buffer, image) === 0) throw new Error ('Duplicate image')
    }
    images.push(buffer);
  }
};