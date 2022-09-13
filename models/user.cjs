'use strict';
const crypto = require('crypto');
const { Model } = require('sequelize');
const SequelizeSlugify = require('sequelize-slugify');
const useBcrypt = require('sequelize-bcrypt');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.Tip, {
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        foreignKey: {
          name: 'authorId',
          type: DataTypes.UUID
        }
      });

      this.belongsToMany(models.Tip, { 
        as: 'reviewedTips', 
        through: models.Rating,
        foreignKey: 'reviewerId',
        otherKey: 'tipId',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      });

      this.hasMany(models.Rating, {
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        foreignKey: {
          name: 'reviewerId',
          type: DataTypes.UUID
        }
      });

      this.hasMany(models.Rating, {
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        foreignKey: {
          name: 'recipientId',
          type: DataTypes.UUID
        }
      });
    }

    getResetPasswordToken () {
      const resetToken = crypto.randomBytes(20).toString('hex');
      this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
      return resetToken;
    }
  }
  User.init({
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    username: { 
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notNull: {
          msg: 'Please provide a username'
        },
        len: {
          args: [ 1, 30 ],
          msg: 'Allowed username length is between 1 and 30 characters'
        }
      }
    },
    slug: DataTypes.STRING,
    email: { 
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notNull: {
          msg: 'Please provide an email'
        },
        isEmail: true
      }
    },
    password: { 
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: {
          args: [ 6 ],
          msg: 'Minimum password length is 6 characters'
        },
        passwordIsProvided(value) {
          if (value.length === 0 && this.passwordSet === true) {
            throw new Error('Please provide a passport')
          }
        }
      }
    },
    passwordSet: { 
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    tipCount: { 
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    status: {
      type: DataTypes.ENUM,
      values: [ 'active', 'passive' ],
      defaultValue: 'passive'
    },
    role: {
      type: DataTypes.ENUM,
      values: [ 'admin', 'user' ],
      defaultValue: 'user'
    },
    resetPasswordToken: DataTypes.STRING,
    resetPasswordExpire: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'User',
    hooks: {
      beforeCreate: (user, options) => {
        user.email = user.email.toLowerCase();
      },
      beforeSave: (user, options) => {
        if (user.changed('email')) user.email = user.email.toLowerCase()
      }
    }
  });

  SequelizeSlugify.slugifyModel(User, {
    source: [ 'username' ],
    slugOptions: {
      lower: true
    }
  });

  useBcrypt(User, {
    field: 'password',
    rounds: 12,
    compare: 'authenticate'
  });

  return User;
};

/** 
todos: 
* lowercase the email address +/-
* exclude password from search results
* full text search
* check on update & on delete settings for associated models +
*/