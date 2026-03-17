const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../data/users.json');

function load() {
  if (!fs.existsSync(file)) return {};
  return JSON.parse(fs.readFileSync(file));
}

function save(data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

module.exports = {
  async getUser(id) {
    const data = load();

    if (!data[id]) {
      data[id] = {
        wallet: 500,
        bank: 0,
        xp: 0,
        level: 1,
        lastWork: 0,
        lastDaily: 0
      };
      save(data);
    }

    return data[id];
  },

  async addMoney(id, amount) {
    const data = load();
    data[id].wallet += amount;
    save(data);
  },

  async setCooldown(id, type) {
    const data = load();
    data[id][type] = Date.now();
    save(data);
  },

  async getAll() {
    return load();
  }
};