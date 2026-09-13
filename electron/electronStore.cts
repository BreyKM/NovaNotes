const fs = require("fs");
const path = require("path");
const { app } = require("electron");

type StoreData = Record<string, unknown>;

class ElectronStore {
  private filepath: string;
  private data: StoreData;


  constructor(filename: string = "store.json") {
    const userDataPath = app.getPath("userData");
    this.filepath = path.join(userDataPath, filename);

    try {
      this.data = JSON.parse(fs.readFileSync(this.filepath, "utf-8"));
    } catch (error) {
      // If file read or parse fails, start with an empty object
      this.data = {};
    }
  }

  get(key: string): unknown {
    return this.data[key];
  }

  set(key: string, value: unknown): void {
    this.data[key] = value;
    this.save();
  }

  delete(key: string): void {
    delete this.data[key];
    this.save();
  }

  save(): void {
    fs.writeFileSync(this.filepath, JSON.stringify(this.data));
  }
}

export = ElectronStore;
