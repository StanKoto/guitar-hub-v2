'use strict';

const fs = require('fs');
const path = require('path');
const slugify = require('slugify');

module.exports = {
  async up (queryInterface, Sequelize) {
    const tips = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/tips.json'), 'utf-8'));
    
    for (const tip of tips) {
      tip.slug = slugify(tip.title, { lower: true });
      tip.createdAt = new Date();
      tip.updatedAt = new Date();
      if (tip.images) tip.images = JSON.stringify(tip.images)
    }

    try {
      await queryInterface.sequelize.transaction(async t => {
        await queryInterface.bulkInsert('Tips', tips, {
          transaction: t
        });
      });
    } catch (err) {
      console.error(err);
    }
  },

  async down (queryInterface, Sequelize) {
    try {
      await queryInterface.sequelize.transaction(async t => {
        await queryInterface.bulkDelete('Tips', null, {
          transaction: t
        });
      });
    } catch (err) {
      console.error(err);
    }
  }
};
