const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  rating: {
    type: Number,
    required: [ true, 'Please rate the tip before submitting your vote' ],
    enum: { values: [1, 2, 3, 4, 5], message: '{VALUE} is not supported, only integers from 1 to 5 are accepted' }
  },
  tip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tip'
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, 
{
  timestamps: true
});

ratingSchema.index({ tip: 1, reviewer: 1 }, { unique: true });

ratingSchema.statics.getAverageRating = async function(tipId) {
  const aggregationResults = await this.aggregate([
    {
      $match: { tip: tipId }
    },
    {
      $group: {
        _id: '$tip',
        averageRating: { $avg: '$rating' }
      }
    }
  ]);

  const averageRating = aggregationResults.length !== 0 ? aggregationResults[0].averageRating.toFixed(1) : 0;

  try {
    await this.model('Tip').findByIdAndUpdate(tipId, { averageRating });
  } catch (err) {
    console.error(err);
  }
};

ratingSchema.post('save', function () {
  this.constructor.getAverageRating(this.tip);
});

ratingSchema.post('remove', function () {
  this.constructor.getAverageRating(this.tip);
});

exports.Rating = mongoose.model('Rating', ratingSchema);