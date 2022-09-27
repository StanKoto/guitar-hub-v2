'use strict';

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const slugify = require('slugify');

module.exports = {
  async up (queryInterface, Sequelize) {
    const users = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/users.json'), 'utf-8'));
    
    for (const user of users) {
      user.password = bcrypt.hashSync(user.password, 12);
      user.slug = slugify(user.username, { lower: true });
      user.createdAt = new Date();
      user.updatedAt = new Date();
    }

    try {
      await queryInterface.sequelize.transaction(async t => {
        await queryInterface.bulkInsert('Users', users, {
          transaction: t
        })
      });
    } catch (err) {
      console.error(err);
    }
  },

  async down (queryInterface, Sequelize) {
    try {
      await queryInterface.sequelize.transaction(async t => {
        await queryInterface.bulkDelete('Users', null, {
          transaction: t
        });
      });
    } catch (err) {
      console.error(err);
    }
  }
};
