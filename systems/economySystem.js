const storage = require("./storage");
const path = require("path");

class Economy {
  constructor() {
    this.file = path.join(__dirname, "../databases/economy.json");
    this.data = storage.read(this.file);
  }

  save() {
    storage.write(this.file, this.data);
  }

  getUser(userId) {
    if (!this.data[userId]) {
      this.data[userId] = { money: 0, lastWork: 0, lastDaily: 0 };
      this.save();
    }
    return this.data[userId];
  }

  addMoney(userId, amount) {
    const user = this.getUser(userId);
    user.money += amount;
    this.save();
  }

  setCooldown(userId, type) {
    const user = this.getUser(userId);
    user[type] = Date.now();
    this.save();
  }

  canWork(userId, cooldown = 5*60*1000) {
    return Date.now() - this.getUser(userId).lastWork >= cooldown;
  }

  canDaily(userId) {
    return Date.now() - this.getUser(userId).lastDaily >= 24*60*60*1000;
  }
}

module.exports = new Economy();