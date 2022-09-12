'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TipReviewers extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  TipReviewers.init({
    reviewerId: { 
      type: DataTypes.UUID,
      references: {
        model: sequelize.models.User,
        key: 'id'
      }
    },
    reviewedTipId: { 
      type: DataTypes.UUID,
      references: {
        model: sequelize.models.Tip,
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'TipReviewers',
  });
  return TipReviewers;
};