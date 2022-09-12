'use strict';

const fs = require('fs');
const path = require('path');

const tipReviewers = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/tipReviewers.json'), 'utf-8'));

for (const tipReviewer of tipReviewers) {
  tipReviewer.createdAt = new Date();
  tipReviewer.updatedAt = new Date();
}

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async t => {
      await queryInterface.bulkInsert('TipReviewers', tipReviewers, {
        transaction: t
      });
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async t => {
      await queryInterface.bulkDelete('TipReviewers', null, {
        transaction: t
      });
    });
  }
};
