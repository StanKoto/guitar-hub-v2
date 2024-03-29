import sign from 'jsonwebtoken/sign.js';
import { generateUsername } from 'unique-username-generator';
import sharp from 'sharp';
import ImageKit from 'imagekit';
import config from '../envVariables.cjs';
import db from '../models/index.cjs';
import { ErrorResponse } from '../utils/errorHandling.js';

const { User } = db;

const imagekit = new ImageKit({
  publicKey: config.imageKit.publicApiKey,
  privateKey: config.imageKit.privateApiKey,
  urlEndpoint: config.imageKit.urlEndpoint
});

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

const createUsername = async (User) => {
  const username = generateUsername('-', 3, 20);
  const existingUser = await User.findOne({ where: { username } });
  if (existingUser) return createUsername(User)
  return username;
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

const processImages = async (req, tip) => {
  if ((tip.images && (tip.images.length + req.files.length > 10)) || req.files.length > 10) throw new Error('Image limit reached')
  if (!tip.images) tip.images = []
  const files = await Promise.all(req.files.map(async file => {
    file.buffer = await sharp(file.buffer).resize(480, 270).png().toBuffer();
    return file;
  }));
  for (const file of files) {
    const response = await imagekit.upload({
      file: file.buffer.toString('base64'),
      fileName: file.originalname.split('.')[0].concat('.png'),
      folder: '/guitar-hub/images'
    });
    const imageData = { id: response.fileId, url: response.url };
    tip.images.push(imageData);
  }
  tip.changed('images', true);
};

const deleteOneImage = async (images, index) => {
  await imagekit.deleteFile(images[index].id);
};

const deleteAllImages = async (images) => {
  await imagekit.bulkDeleteFiles(images);
};

export { 
  asyncHandler,
  createJwtTokenAndSetCookie, 
  checkPassword, 
  createUsername,
  checkAuthorship, 
  checkUserStatus,
  checkResource,
  processImages,
  deleteOneImage,
  deleteAllImages
};