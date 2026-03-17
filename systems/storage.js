const fs = require("fs");
const path = require("path");

module.exports = {
  read(file) {
    if (!fs.existsSync(file)) return {};
    try {
      return JSON.parse(fs.readFileSync(file, "utf8"));
    } catch {
      return {};
    }
  },
  write(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  }
};