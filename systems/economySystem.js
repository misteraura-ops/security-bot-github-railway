const fs = require('fs');
const path = require('path');
const cooldowns = require('../utils/cooldowns');

const dataFile = path.join(__dirname, '../data/users.json');
let users = {};

if (fs.existsSync(dataFile)) {
  users = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
}

function save() {
  fs.writeFileSync(dataFile, JSON.stringify(users, null, 2));
}

module.exports = {
  async getUser(userId) {
    if (!users[userId]) {
      users[userId] = { money: 0, lastWork: 0, lastDaily: 0 };
      save();
    }
    return users[userId];
  },

  async addMoney(userId, amount) {
    const user = await this.getUser(userId);
    user.money += amount;
    save();
    return user;
  },

  async removeMoney(userId, amount) {
    const user = await this.getUser(userId);
    user.money = Math.max(user.money - amount, 0);
    save();
    return user;
  },

  async setCooldown(userId, type) {
    const user = await this.getUser(userId);
    user[type] = Date.now();
    save();
  },

  async checkCooldown(userId, type, ms) {
    const user = await this.getUser(userId);
    const now = Date.now();
    if (!user[type] || now - user[type] > ms) return true;
    return false;
  }
};