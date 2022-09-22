'use strict';
const { Model, QueryTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Rating extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Tip, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        foreignKey: {
          name: 'tipId',
          type: DataTypes.UUID,
          allowNull: false
        }
      });

      this.belongsTo(models.User, {
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        as: 'reviewer',
        foreignKey: {
          name: 'reviewerId',
          type: DataTypes.UUID
        }
      });

      this.belongsTo(models.User, {
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        as: 'recipient',
        foreignKey: {
          name: 'recipientId',
          type: DataTypes.UUID
        }
      });
    }

    async getAverageRating(options) {
      const averageRating = await sequelize.query('SELECT AVG(rating) FROM "Ratings" WHERE "Ratings"."tipId" = ?;', {
        replacements: [ this.tipId ],
        type: QueryTypes.SELECT,
        raw: true,
        plain: true,
        transaction: options.transaction
      });

      await sequelize.models.Tip.update({ averageRating: averageRating.avg }, {
        where: {
          id: this.tipId
        },
        transaction: options.transaction
      });
    }
  }
  Rating.init({
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Please rate the tip before submitting your vote'
        },
        isIn: {
          args: [[ 1, 2, 3, 4, 5 ]],
          msg: 'Submitted rating is not supported, only integers from 1 to 5 are accepted'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Rating',
    indexes: [
      {
        unique: true,
        fields: [ 'tipId', 'reviewerId' ]
      }
    ],
    hooks: {
      afterCreate: async (rating, options) => {
        try {
          await rating.getAverageRating(options);
        } catch (err) {
          console.error(err);
        }
      },
      afterDestroy: async (rating, options) => {
        try {
          await rating.getAverageRating(options);
        } catch (err) {
          console.error(err);
        }
      }
    }
  });

  return Rating;
};