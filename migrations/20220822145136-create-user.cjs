'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.sequelize.transaction(async t => {
        await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";', {
          transaction: t
        });
        await queryInterface.createTable('Users', {
          id: {
            type: Sequelize.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: Sequelize.literal('uuid_generate_v4()')
          },
          username: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true
          },
          slug: {
            type: Sequelize.STRING
          },
          email: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true
          },
          password: {
            type: Sequelize.STRING,
            allowNull: true,
    
          },
          passwordSet: {
            type: Sequelize.BOOLEAN,
            defaultValue: true
          },
          tipCount: {
            type: Sequelize.INTEGER,
            defaultValue: 0
          },
          status: {
            type: Sequelize.ENUM,
            values: [ 'active', 'passive' ],
            defaultValue: 'passive'
          },
          role: {
            type: Sequelize.ENUM,
            values: [ 'admin', 'user' ],
            defaultValue: 'user'
          },
          resetPasswordToken: {
            type: Sequelize.STRING
          },
          resetPasswordExpire: {
            type: Sequelize.DATE
          },
          createdAt: {
            allowNull: false,
            type: Sequelize.DATE
          },
          updatedAt: {
            allowNull: false,
            type: Sequelize.DATE
          }
        },
        {
          transaction: t
        });
      });
    } catch (err) {
      console.error(err);
    }
  },
  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.sequelize.transaction(async t => {
        await queryInterface.dropTable('Users', {
          transaction: t
        });
  
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Users_status";', {
          transaction: t
        });
        
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Users_role";', {
          transaction: t
        });
      });
    } catch (err) {
      console.error(err);
    }
  }
};