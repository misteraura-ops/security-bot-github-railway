const fs = require("fs");
const path = require("path");

const dataFile = path.join(__dirname, "../data/users.json");
if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, "{}");

function read() {
  return JSON.parse(fs.readFileSync(dataFile, "utf8"));
}

function write(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

module.exports = { read, write };