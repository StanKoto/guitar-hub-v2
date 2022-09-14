'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.sequelize.transaction(async t => {
        await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";', {
          transaction: t
        });
        await queryInterface.createTable('Ratings', {
          id: {
            type: Sequelize.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: Sequelize.literal('uuid_generate_v4()')
          },
          rating: {
            type: Sequelize.INTEGER,
            allowNull: false
          },
          tipId: {
            type: Sequelize.UUID,
            allowNull: false,
            references: {
              model: 'Tips',
              key: 'id'
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
          },
          reviewerId: {
            type: Sequelize.UUID,
            references: {
              model: 'Users',
              key: 'id'
            },
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE'
          },
          recipientId: {
            type: Sequelize.UUID,
            references: {
              model: 'Users',
              key: 'id'
            },
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE'
          },
          createdAt: {
            allowNull: false,
            type: Sequelize.DATE
          },
          updatedAt: {
            allowNull: false,
            type: Sequelize.DATE
          }
        }, {
          transaction: t
        });

        await queryInterface.addConstraint('Ratings', {
          fields: ['rating'],
          type: 'check',
          where: {
            rating: [ 1, 2, 3, 4, 5 ]
          },
          transaction: t
        });
  
        await queryInterface.addIndex('Ratings', [ 'tipId', 'reviewerId' ], {
          unique: true,
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
        await queryInterface.dropTable('Ratings', {
          transaction: t
        });
      });
    } catch (err) {
      console.error(err);
    }
  }
};