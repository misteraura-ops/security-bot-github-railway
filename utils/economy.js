const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../data/economy.json');

function load() {
    if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, '{}');
    return JSON.parse(fs.readFileSync(filePath));
}

function save(data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function getLevel(xp) {
    return Math.floor(0.1 * Math.sqrt(xp));
}

function getUser(id) {
    const data = load();
    if (!data[id]) {
        data[id] = {
            wallet: 1000,
            bank: 0,
            xp: 0,
            marriedTo: null,
            house: null
        };
        save(data);
    }
    return data[id];
}

function updateUser(id, newData) {
    const data = load();
    data[id] = newData;
    save(data);
}

module.exports = { getUser, updateUser, load, getLevel };