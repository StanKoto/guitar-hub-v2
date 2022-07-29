import sign from 'jsonwebtoken/sign.js';
import sharp from 'sharp';
import config from '../envVariables.js';
import { User } from '../models/User.js';
import { ErrorResponse } from '../utils/errorHandling.js';

const asyncHandler = fn => (req, res, next) =>
Promise
  .resolve(fn(req, res, next))
  .catch(next);

const createJwtTokenAndSetCookie = (id, res, status = 200) => {
  const token = sign({ id }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn
  });
  const cookieOptions = { httpOnly: true, maxAge: config.cookie.maxAge };
  if (config.main.env === 'production') cookieOptions.secure = true
  res.cookie('jwt', token, cookieOptions);
  res.status(status).json({ success: true });
};

const checkPassword = async (req, user, password) => {
  let errorMessage = 'Invalid credentials';
  if (req.user) errorMessage = 'Invalid password'
  const isMatch = await user.matchPassword(password);
  if (!isMatch) throw new Error(errorMessage)
};

const checkAuthorship = (req, tip) => {
  if ((!tip.author || tip.author && !tip.author.equals(req.user._id)) && req.user.role === 'user') {
    throw new ErrorResponse('You are not authorized to alter or delete this tip!', 401);
  }
};

const checkUserStatus = async (req) => {
  if (req.user.status === 'passive') {
    const updatedUser = await User.findByIdAndUpdate(req.user._id, { status: 'active' }, {
      runValidators: true,
      new: true
    });
    if (!updatedUser) throw new ErrorResponse(`No user found with ID of ${req.user._id}`, 404)
  }
};

const checkResource = async (req, model, select, populate) => {
  const id = req.params.id || req.user._id;
  let resource = model.findById(id)
  if (select) resource = await resource.select(select)
  if (populate) resource = await resource.populate(populate)
  if (!resource) throw new ErrorResponse(`No ${model.collection.collectionName.toLowerCase()} found with ID of ${id}`, 404)
  return resource;
};

const processImages = async (req, images) => {
  const bufferArray = await Promise.all(req.files.map(file => sharp(file.buffer).resize(480, 270).png().toBuffer()));
  for (const buffer of bufferArray) {
    for(const image of images) {
      if (Buffer.compare(buffer, image) === 0) throw new Error ('Duplicate image')
    }
    images.push(buffer);
  }
};

export { 
  asyncHandler,
  createJwtTokenAndSetCookie, 
  checkPassword, 
  checkAuthorship, 
  checkUserStatus,
  checkResource,
  processImages
};