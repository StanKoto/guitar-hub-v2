const mongoose = require('mongoose');
const slugify = require('slugify');

const tipSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [ true, 'Please provide a tip title' ],
    maxLength: [ 50, 'Maximum title length is 50 characters' ]
  },
  slug: String,
  contents: {
    type: String,
    required: [ true, 'Please enter some tip contents' ],
    maxLength: [ 5000, 'Maximum contents length is 5000 characters' ]
  },
  category: {
    type: String,
    enum: [ 'Guitar, strings and accessories choice', 'Care and maintenance', 'Recording and amplification', 'Other topics' ],
    required: [ true, 'Please choose a category for your tip' ]
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  averageRating: {
    type: Number
  },
  images: {
    type: [ Buffer ],
    select: false,
    validate: [ arrayLimit, 'The number of {PATH} provided the tip would exceeed the limit of 10, please select less images or delete some of the already attached ones' ]
  }
},
{
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

function arrayLimit(val) {
  return val.length <= 10;
};

tipSchema.virtual('ratings', {
  ref: 'Rating',
  localField: '_id',
  foreignField: 'tip',
  justOne: false
});

tipSchema.index({ title: 'text', contents: 'text' });

tipSchema.statics.getTipCount = async function (authorId) {
  const aggregationResults = await this.aggregate([
    {
      $match: { author: authorId }
    },
    {
      $group: {
        _id: null,
        tipCount: {$count: { }}
      }
    }
  ]);

  const tipCount = aggregationResults.length !== 0 ? aggregationResults[0].tipCount : 0;

  try {
    await this.model('User').findByIdAndUpdate(authorId, { tipCount });
  } catch (err) {
    console.error(err);
  }
};

tipSchema.pre('save', function (next) {
  this.slug = slugify(this.title, { lower: true });
  next();
});

tipSchema.post('save', function () {
  this.constructor.getTipCount(this.author);
});

tipSchema.post('remove', function () {
  this.constructor.getTipCount(this.author);
});

tipSchema.pre('remove', async function () {
  await this.model('Rating').deleteMany({ tip: this._id });
});


exports.Tip = mongoose.model('Tip', tipSchema);