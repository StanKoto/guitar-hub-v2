'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.sequelize.transaction(async t => {
        await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";', {
          transaction: t
        });
        await queryInterface.createTable('Tips', {
          id: {
            type: Sequelize.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: Sequelize.literal('uuid_generate_v4()')
          },
          title: {
            type: Sequelize.STRING(50),
            allowNull: false
          },
          slug: {
            type: Sequelize.STRING
          },
          contents: {
            type: Sequelize.STRING(5000),
            allowNull: false
          },
          category: {
            type: Sequelize.ENUM,
            values: [ 'Guitar, strings and accessories choice', 'Care and maintenance', 'Recording and amplification', 'Other topics' ],
            allowNull: false
          },
          averageRating: {
            type: Sequelize.DECIMAL(10, 1)
          },
          authorId: {
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
      });
    } catch (err) {
      console.error(err);
    }
  },
  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.sequelize.transaction(async t => {
        await queryInterface.dropTable('Tips', {
          transaction: t
        });
  
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Tips_category";', {
          transaction: t
        });
      });
    } catch (err) {
      console.error(err);
    }
  }
};