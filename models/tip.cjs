'use strict';
const { Model } = require('sequelize');
const SequelizeSlugify = require('sequelize-slugify');

module.exports = (sequelize, DataTypes) => {
  class Tip extends Model {
    static associate(models) {
      this.belongsTo(models.User, {
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        as: 'author',
        foreignKey: {
          name: 'authorId',
          type: DataTypes.UUID
        }
      });

      this.belongsToMany(models.User, {
        as: 'reviewers',
        through: models.Rating,
        foreignKey: 'tipId',
        otherKey: 'reviewerId',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });

      this.hasMany(models.Rating, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        foreignKey: {
          name: 'tipId',
          type: DataTypes.UUID,
          allowNull: false
        }
      })
    }

    async getTipCount(options) {
      const tipCount = await sequelize.models.Tip.count({
        where: {
          authorId: this.authorId
        },
        transaction: options.transaction
      });

      await sequelize.models.User.update({ tipCount }, {
        where: {
          id: this.authorId
        },
        transaction: options.transaction
      });
    }
  }
  Tip.init({
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    title: { 
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Please provide a tip title'
        },
        len: {
          args: [ 1, 50 ],
          msg: 'Allowed title length is between 1 and 50 characters'
        }
      }
    },
    slug: DataTypes.STRING,
    contents: { 
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Please enter some tip contents',
        },
        len: {
          args: [ 1, 5000 ],
          msg: 'Allowed contents length is between 1 and 5000 characters'
        }
      }
    },
    category: { 
      type: DataTypes.ENUM,
      values: [ 'Guitar, strings and accessories choice', 'Care and maintenance', 'Recording and amplification', 'Other topics' ],
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Please choose a category for your tip'
        }
      }
    },
    averageRating: DataTypes.DECIMAL(10, 1),
    images: {
      type: DataTypes.JSONB,
      validate: {
        hasValidLength(value) {
          if (value.length > 10) throw new Error('The number of images provided for the tip would exceeed the limit of 10, please select less images or delete some of the already attached ones')
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Tip',
    hooks: {
      afterCreate: async (tip, options) => {
        try {
          await tip.getTipCount(options);
        } catch (err) {
          console.error(err);
        }
      },
      afterDestroy: async (tip, options) => {
        try {
          await tip.getTipCount(options);
        } catch (err) {
          console.error(err);
        }
      }
    }
  });

  SequelizeSlugify.slugifyModel(Tip, {
    source: [ 'title' ],
    slugOptions: {
      lower: true
    }
  });

  return Tip;
};