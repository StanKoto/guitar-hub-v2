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
    try {
      await queryInterface.sequelize.transaction(async t => {
        await queryInterface.bulkInsert('Tips', tips, {
          transaction: t
        });
        await queryInterface.sequelize.query(`UPDATE "Tips" SET "images" = ARRAY['{"id":"nldknclkdc","url":"https://imagekit/image.jpg"}','{"id":"kjdnckjncc","url":"https://imagekit/image2.jpg"}','{"id":"nldknclkdc","url":"https://imagekit/image.jpg"}','{"id":"kjdnckjncc","url":"https://imagekit/image2.jpg"}','{"id":"nldknclkdc","url":"https://imagekit/image.jpg"}','{"id":"kjdnckjncc","url":"https://imagekit/image2.jpg"}','{"id":"nldknclkdc","url":"https://imagekit/image.jpg"}','{"id":"kjdnckjncc","url":"https://imagekit/image2.jpg"}','{"id":"nldknclkdc","url":"https://imagekit/image.jpg"}','{"id":"kjdnckjncc","url":"https://imagekit/image2.jpg"}']::json[] WHERE "id"='7bbafbd9-c49d-49c7-9e2f-3a7bb9547158'`, {
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
