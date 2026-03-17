const storage = require("./storage");

class Economy {
  constructor() {
    this.users = storage.read();
  }

  save() {
    storage.write(this.users);
  }

  getUser(userId) {
    if (!this.users[userId]) {
      this.users[userId] = {
        money: 0,
        lastWork: 0,
        lastDaily: 0
      };
      this.save();
    }
    return this.users[userId];
  }

  addMoney(userId, amount) {
    const user = this.getUser(userId);
    user.money += amount;
    this.save();
  }

  canWork(userId) {
    const user = this.getUser(userId);
    return Date.now() - user.lastWork >= 5 * 60 * 1000; // 5 min cooldown
  }

  setWorkCooldown(userId) {
    const user = this.getUser(userId);
    user.lastWork = Date.now();
    this.save();
  }

  canDaily(userId) {
    const user = this.getUser(userId);
    return Date.now() - user.lastDaily >= 24 * 60 * 60 * 1000; // 24h
  }

  setDailyCooldown(userId) {
    const user = this.getUser(userId);
    user.lastDaily = Date.now();
    this.save();
  }
}

module.exports = new Economy();