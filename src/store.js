const fs = require('fs');
const path = require('path');

class Store {
  constructor(file) {
    this.file = path.resolve(file);
    this.data = {
      users: {},
      apks: {},
      forceJoin: [],
      nextApkId: 1,
      settings: {}
    };
    this.load();
  }

  load() {
    fs.mkdirSync(path.dirname(this.file), { recursive: true });
    if (fs.existsSync(this.file)) {
      try {
        this.data = { ...this.data, ...JSON.parse(fs.readFileSync(this.file, 'utf8')) };
      } catch (error) {
        console.error('Could not read data file, starting with defaults:', error.message);
      }
    }
    this.save();
  }

  save() {
    const temp = `${this.file}.tmp`;
    fs.writeFileSync(temp, JSON.stringify(this.data, null, 2));
    fs.renameSync(temp, this.file);
  }

  upsertUser(user) {
    const id = String(user.id);
    this.data.users[id] = {
      ...(this.data.users[id] || {}),
      id: user.id,
      firstName: user.first_name || this.data.users[id]?.firstName || '',
      username: user.username || this.data.users[id]?.username || '',
      joinedAt: this.data.users[id]?.joinedAt || new Date().toISOString(),
      banned: this.data.users[id]?.banned || false
    };
    this.save();
    return this.data.users[id];
  }

  getUser(id) { return this.data.users[String(id)]; }
  allUsers() { return Object.values(this.data.users); }
  setBanned(id, value) {
    const user = this.getUser(id) || { id: Number(id) };
    this.data.users[String(id)] = { ...user, id: Number(id), banned: value };
    this.save();
  }

  addApk({ title, description, fileId, fileName, mimeType, size, addedBy }) {
    const id = String(this.data.nextApkId++);
    this.data.apks[id] = { id: Number(id), title, description, fileId, fileName, mimeType, size, addedBy, addedAt: new Date().toISOString() };
    this.save();
    return this.data.apks[id];
  }
  getApk(id) { return this.data.apks[String(id)]; }
  allApks() { return Object.values(this.data.apks).sort((a, b) => b.id - a.id); }
  deleteApk(id) { delete this.data.apks[String(id)]; this.save(); }

  addForceJoin(channel) {
    this.data.forceJoin = this.data.forceJoin.filter(item => String(item.chatId) !== String(channel.chatId));
    this.data.forceJoin.push(channel);
    this.save();
  }
  removeForceJoin(chatId) { this.data.forceJoin = this.data.forceJoin.filter(item => String(item.chatId) !== String(chatId)); this.save(); }
  forceJoinChannels() { return this.data.forceJoin; }
}

module.exports = Store;
