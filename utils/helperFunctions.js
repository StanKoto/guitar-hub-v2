import sign from 'jsonwebtoken/sign.js';
import sharp from 'sharp';
import config from '../envVariables.cjs';
import db from '../models/index.cjs';
import { ErrorResponse } from '../utils/errorHandling.js';

const { User } = db;

const asyncHandler = fn => (req, res, next) =>
Promise
  .resolve(fn(req, res, next))
  .catch(next);

const createJwtTokenAndSetCookie = (req, res, id, status = 200) => {
  const token = sign({ id }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn
  });
  const cookieOptions = { httpOnly: true, maxAge: config.cookie.maxAge };
  if (config.main.env === 'production') cookieOptions.secure = true
  res.cookie('jwt', token, cookieOptions);
  if (req.method === 'GET') return res.redirect('/')
  res.status(status).json({ success: true });
};

const checkPassword = (req, user, password) => {
  let errorMessage = 'Invalid credentials';
  if (req.user) errorMessage = 'Invalid password'
  const isMatch = user.authenticate(password);
  if (!isMatch) throw new Error(errorMessage)
};

const checkAuthorship = (req, tip) => {
  if ((!tip.authorId || tip.authorId !== req.user.id) && req.user.role === 'user') {
    throw new ErrorResponse('You are not authorized to alter or delete this tip!', 401);
  }
};

const checkUserStatus = async (req, transaction) => {
  if (req.user.status === 'passive') {
    const userToUpdate = await User.findByPk(req.user.id, { transaction });
    if (!userToUpdate) throw new ErrorResponse(`No user found with ID of ${req.user.id}`, 404)
    userToUpdate.status = 'active';
    await userToUpdate.save({ transaction });
  }
};

const checkResource = async (req, model, attributesToExclude, associatedModel) => {
  const id = req.params.id || req.user.id;
  let options = {};
  if (attributesToExclude) options.attributes = { exclude: attributesToExclude }
  if (associatedModel) options.include = associatedModel
  const resource = await model.findByPk(id, options);
  if (!resource) throw new ErrorResponse(`No ${model.name.toLowerCase()} found with ID of ${id}`, 404)
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