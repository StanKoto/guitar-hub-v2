'use strict';

const fs = require('fs');
const path = require('path');
const slugify = require('slugify');

module.exports = {
  async up (queryInterface, Sequelize) {
    const tips = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/tips.json'), 'utf-8'));
    const images = [];
    
    for (const tip of tips) {
      tip.slug = slugify(tip.title, { lower: true });
      tip.createdAt = new Date();
      tip.updatedAt = new Date();
      if (tip.images) {
        images.push({ tipId: tip.id, imageData: tip.images.map(image => `'${JSON.stringify(image)}'`) });
        delete tip.images;
      }
    }

    try {
      await queryInterface.sequelize.transaction(async t => {
        await queryInterface.bulkInsert('Tips', tips, {
          transaction: t
        });
        for (const image of images) {
          await queryInterface.sequelize.query(`UPDATE "Tips" SET "images" = ARRAY[${image.imageData}]::json[] WHERE "id"='${image.tipId}'`, {
            transaction: t
          });
        }
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
