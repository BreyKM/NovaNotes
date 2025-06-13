const fs = require("fs");
const path = require("path");
const { app } = require("electron");

class ElectronStore {
  constructor(filename = "store.json") {
    const userDataPath = app.getPath("userData");
    this.filepath = path.join(userDataPath, filename);

    try {
      this.data = JSON.parse(fs.readFileSync(this.filepath, "utf-8"));
      console.log(app.getPath("userData"));
    } catch (error) {
      // If file read or parse fails, start with an empty object
      this.data = {};
    }
  }

  get(key) {
    return this.data[key];
  }

  set(key, value) {
    this.data[key] = value;
    console.log(app.getPath("userData"));
    this.save();
  }

  delete(key) {
    delete this.data[key];
    this.save();
  }

  save() {
    fs.writeFileSync(this.filepath, JSON.stringify(this.data));
    console.log(app.getPath("userData"));
  }
}

module.exports = ElectronStore;
