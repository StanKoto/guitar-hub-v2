'use strict';

const fs = require('fs');
const path = require('path');

const ratings = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/ratings.json'), 'utf-8'));

for (const rating of ratings) {
  rating.createdAt = new Date();
  rating.updatedAt = new Date();
}

module.exports = {
  async up (queryInterface, Sequelize) {
    try {
      await queryInterface.sequelize.transaction(async t => {
        await queryInterface.bulkInsert('Ratings', ratings, {
          transaction: t
        });
      });
    } catch (err) {
      console.error(err);
    }
  },

  async down (queryInterface, Sequelize) {
    try{
      await queryInterface.sequelize.transaction(async t => {
        await queryInterface.bulkDelete('Ratings', null, {
          transaction: t
        });
      });
    } catch (err) {
      console.error(err);
    }
  }
};
