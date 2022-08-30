'use strict';

const fs = require('fs');
const path = require('path');
const slugify = require('slugify');

const tips = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/tips.json'), 'utf-8'));

for (const tip of tips) {
  tip.slug = slugify(tip.title, { lower: true });
  tip.createdAt = new Date();
  tip.updatedAt = new Date();
}

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async t => {
      await queryInterface.bulkInsert('Tips', tips, {
        transaction: t
      });
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async t => {
      await queryInterface.bulkDelete('Tips', null, {
        transaction: t
      });
    });
  }
};
