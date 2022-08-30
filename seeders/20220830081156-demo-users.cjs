'use strict';

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const slugify = require('slugify');

const users = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/users.json'), 'utf-8'));

for (const user of users) {
  user.password = bcrypt.hashSync(user.password, 12);
  user.slug = slugify(user.username, { lower: true });
  user.createdAt = new Date();
  user.updatedAt = new Date();
}

module.exports = {
  async up (queryInterface, Sequelize) {
   await queryInterface.sequelize.transaction(async t => {
     await queryInterface.bulkInsert('Users', users, {
        transaction: t
      })
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async t => {
      await queryInterface.bulkDelete('Users', null, {
        transaction: t
      });
    });
  }
};
