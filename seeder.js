import * as fs from 'fs';
import mongoose from 'mongoose';
import config from './envVariables.js';
import { User } from './models/User.js';
import { Tip } from './models/Tip.js';
import { Rating } from './models/Rating.js';

const users = JSON.parse(fs.readFileSync(new URL('data/users.json', import.meta.url)), 'utf-8');
const tips = JSON.parse(fs.readFileSync(new URL('data/tips.json', import.meta.url)), 'utf-8');
const ratings = JSON.parse(fs.readFileSync(new URL('data/ratings.json', import.meta.url)), 'utf-8');

const insertData = async () => {
  await User.create(users);
  await Tip.create(tips);
  for (const rating of ratings) {
    const newRating = new Rating(rating);
    await newRating.save();
  }
  console.log('Data inserted!');
  process.exit();
};

const deleteData = async () => {
  await User.deleteMany();
  await Tip.deleteMany();
  await Rating.deleteMany();
  console.log('Data deleted!');
  process.exit();
};

mongoose.connect(config.db.mongoUri)
  .then(res => {
    if (process.argv[2] === '-i') {
      insertData();
    } else if (process.argv[2] === '-d') {
      deleteData();
    }
  })
  .catch(err => console.error(err));