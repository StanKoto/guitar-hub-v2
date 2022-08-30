'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async t => {
      await queryInterface.createTable('Tips', {
        id: {
          type: Sequelize.UUID,
          allowNull: false,
          primaryKey: true,
          defaultValue: Sequelize.UUIDV4
        },
        title: {
          type: Sequelize.STRING,
          allowNull: false
        },
        slug: {
          type: Sequelize.STRING
        },
        contents: {
          type: Sequelize.STRING,
          allowNull: false
        },
        category: {
          type: Sequelize.ENUM,
          values: [ 'Guitar, strings and accessories choice', 'Care and maintenance', 'Recording and amplification', 'Other topics' ],
          allowNull: false
        },
        averageRating: {
          type: Sequelize.DECIMAL(1)
        },
        author: {
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
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async t => {
      await queryInterface.dropTable('Tips', {
        transaction: t
      });

      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Tips_category";', {
        transaction: t
      });
    });
  }
};