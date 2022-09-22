'use strict';
const { Model, QueryTypes } = require('sequelize');
const SequelizeSlugify = require('sequelize-slugify');

module.exports = (sequelize, DataTypes) => {
  class Tip extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
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
      type: DataTypes.ARRAY(DataTypes.JSONB),
      validate: {
        async hasValidLength (value) {
          const result = await sequelize.query(`SELECT COALESCE((SELECT CARDINALITY(images) FROM "Tips" WHERE "id"='${this.id}'), 0) AS length`, {
            type: QueryTypes.SELECT,
            plain: true,
            raw: true
          });
          if ((result.length + this.images.length) > 10) throw new Error('The number of images provided for the tip would exceeed the limit of 10, please select less images or delete some of the already attached ones');
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